import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { Prisma } from "@prisma/client";
import type { GoogleProfile } from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-errors";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import { findActiveUser, issuedForCurrentPassword } from "@/lib/account-status";
import { emailsMatch, nameFromGoogle, pendingUsername } from "@/lib/account-rules";
import { LINK_INTENT_TTL_MS, readLinkIntent, signLinkIntent } from "@/lib/link-intent";
import {
  ACCOUNT_SUSPENDED,
  GOOGLE_EMAIL_IN_USE,
  GOOGLE_EMAIL_UNVERIFIED,
  SIGN_IN_SERVER_ERROR,
} from "@/lib/account-notices";

// Everything that decides what a Google sign-in means, called from NextAuth's
// signIn callback (src/lib/auth.ts). It answers true (sign in as the account
// with this Google ID) or a URL to send the person to instead.
//
// Google sign-ins are matched on Google's account ID, never on the email: an
// email address in our table was typed at sign-up and never checked, so
// matching on it could hand someone else's account to whoever controls that
// address at Google -- or leave a stranger holding a password to an account
// that is now theirs. So an email that already has an account is refused, and
// linking happens only from settings, signed in, with the email matching.

const LINK_COOKIE = "bm-google-link";
// NextAuth's own rule for when its cookies get the __Secure- prefix (and the
// one getToken uses), so these names always match the ones it set.
const secure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL;
const cookieName = (name: string) => (secure ? `__Secure-next-auth.${name}` : `next-auth.${name}`);

// Settings → "Connect Google": remember for a few minutes that this account
// asked to connect one. Only the auth routes ever receive the cookie.
export async function setGoogleLinkIntent(userId: string) {
  const expires = Date.now() + LINK_INTENT_TTL_MS;
  (await cookies()).set(LINK_COOKIE, signLinkIntent(userId, expires, process.env.NEXTAUTH_SECRET ?? ""), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth",
    maxAge: LINK_INTENT_TTL_MS / 1000,
  });
}

// Read once: whatever happens next, the intent is used up.
async function takeGoogleLinkIntent(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(LINK_COOKIE)?.value;
  if (value) jar.set(LINK_COOKIE, "", { path: "/api/auth", maxAge: 0 });
  return readLinkIntent(value, process.env.NEXTAUTH_SECRET ?? "", Date.now());
}

// The account the browser is signed in to right now, by the same rules as
// getSessionUserId (which can't be used here: it would import this module's
// importer). An account still choosing its username can't connect anything.
async function currentlySignedInUserId(): Promise<string | null> {
  const raw = (await cookies()).get(cookieName("session-token"))?.value;
  if (!raw) return null;
  const token = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET ?? "" }).catch(() => null);
  const id = typeof token?.id === "string" ? token.id : null;
  if (!id) return null;
  const active = await findActiveUser(id);
  const stamp = typeof token?.passwordStamp === "number" ? token.passwordStamp : undefined;
  return active && !active.needsUsername && issuedForCurrentPassword(active, stamp) ? active.id : null;
}

// Back to the login page with an error code, keeping the place the person was
// trying to reach (NextAuth holds it in a cookie during the round trip).
async function loginError(code: string): Promise<string> {
  const params = new URLSearchParams({ error: code });
  const stored = (await cookies()).get(cookieName("callback-url"))?.value;
  if (stored && URL.canParse(stored, "http://placeholder")) {
    const url = new URL(stored, "http://placeholder");
    const callbackPath = safeCallbackUrl(`${url.pathname}${url.search}`);
    if (callbackPath !== "/") params.set("callbackUrl", callbackPath);
  }
  return `/login?${params}`;
}

const settingsResult = (result: string) => `/settings?google=${result}`;

export async function googleSignIn(googleId: string, profile: GoogleProfile | undefined): Promise<true | string> {
  const intentUserId = await takeGoogleLinkIntent();
  try {
    if (!profile?.email || profile.email_verified !== true) {
      return intentUserId ? settingsResult("unverified") : await loginError(GOOGLE_EMAIL_UNVERIFIED);
    }
    const linked = await prisma.user.findUnique({ where: { googleId }, select: { id: true, suspendedAt: true } });

    if (intentUserId) return await connect(intentUserId, linked, googleId, profile.email);

    if (linked) return linked.suspendedAt ? await loginError(ACCOUNT_SUSPENDED) : true;

    // Someone new to us -- unless the address already has an account.
    const sameEmail = await prisma.user.findFirst({
      where: { email: { equals: profile.email, mode: "insensitive" } },
      select: { id: true },
    });
    if (sameEmail) return await loginError(GOOGLE_EMAIL_IN_USE);

    await prisma.user.create({
      data: {
        name: nameFromGoogle(profile.name, profile.email),
        email: profile.email,
        emailVerified: new Date(),
        googleId,
        username: pendingUsername(randomBytes(6).toString("hex")),
        needsUsername: true,
      },
    });
    return true;
  } catch (err) {
    // Two sign-ins racing for the same address or Google ID.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return intentUserId ? settingsResult("taken") : await loginError(GOOGLE_EMAIL_IN_USE);
    }
    console.error(`[auth] database error during Google sign-in: ${describeDbError(err)}`);
    return intentUserId ? settingsResult("error") : await loginError(SIGN_IN_SERVER_ERROR);
  }
}

// Settings → "Connect Google", back from Google. Links only to the account
// that asked, only while it is still the one signed in, and only when the
// Google account's verified email is that account's email -- which is what
// marks the account's email verified.
async function connect(
  intentUserId: string,
  linked: { id: string } | null,
  googleId: string,
  googleEmail: string
): Promise<true | string> {
  if ((await currentlySignedInUserId()) !== intentUserId) return settingsResult("expired");
  if (linked) return linked.id === intentUserId ? true : settingsResult("taken");

  const account = await prisma.user.findUnique({
    where: { id: intentUserId },
    select: { email: true, googleId: true, emailVerified: true },
  });
  if (!account) return settingsResult("error");
  if (account.googleId) return settingsResult("already");
  if (!emailsMatch(account.email, googleEmail)) return settingsResult("email-mismatch");

  await prisma.user.update({
    where: { id: intentUserId },
    data: { googleId, emailVerified: account.emailVerified ?? new Date() },
  });
  return true;
}
