import { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-errors";
import { findActiveUser, issuedForCurrentPassword } from "@/lib/account-status";
import { passwordStamp } from "@/lib/account-rules";
import { googleSignIn } from "@/lib/google-auth";
import { ACCOUNT_SUSPENDED, GOOGLE_ONLY_ACCOUNT, SIGN_IN_SERVER_ERROR } from "@/lib/account-notices";

// What a login token holds about its account, however it signed in.
function accountClaims(
  user: Pick<User, "id" | "name" | "email" | "username" | "role" | "passwordChangedAt" | "needsUsername">
) {
  return {
    sub: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    // Fixed for the token's lifetime: a later password change makes it
    // stale (see the session callback).
    passwordStamp: passwordStamp(user.passwordChangedAt),
    needsUsername: user.needsUsername,
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // Failed Google round trips come back here too, as ?error=<code>.
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "ইমেইল", type: "email" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      // Error codes thrown here reach the browser as result.error. NextAuth
      // URL-encodes a thrown error's message straight into its response, so
      // they must be fixed codes and never the original error: a Prisma
      // connection error names the database host.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // A failed lookup -- typically Neon waking from sleep -- is not a wrong
        // password, so it must not come back as CredentialsSignin. Throwing is
        // what makes NextAuth report a different error code to the client.
        let user: User | null;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        } catch (err) {
          console.error(`[auth] database error during sign-in: ${describeDbError(err)}`);
          throw new Error(SIGN_IN_SERVER_ERROR);
        }
        if (!user) return null;

        // Created through Google and no password set: point them to Google.
        if (!user.passwordHash) throw new Error(GOOGLE_ONLY_ACCOUNT);

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // Checked only after the password, so a wrong guess can't learn that
        // an account is suspended.
        if (user.suspendedAt) throw new Error(ACCOUNT_SUSPENDED);

        return accountClaims(user);
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Always offer the account chooser: connecting from settings has to be
      // the Google account with the right email, not whichever is signed in.
      authorization: { params: { prompt: "select_account" } },
      // Only what is kept: Google's account ID, name and email. Google also
      // sends a photo URL; it is dropped here and never reaches the token.
      profile(profile: GoogleProfile) {
        return { id: profile.sub, name: profile.name, email: profile.email, username: "", role: "" };
      },
    }),
  ],
  callbacks: {
    // Google sign-ins are decided in src/lib/google-auth.ts: match on Google's
    // account ID, refuse an email that already has an account, link only from
    // settings. Email/password was decided in authorize() above.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      return googleSignIn(account.providerAccountId, profile as GoogleProfile | undefined);
    },
    // role rides along only so the UI can decide whether to show admin
    // affordances. It's baked into the token at login, so a demoted admin
    // would keep it until the token expires — every actual authorization
    // decision re-reads the role from the database (see src/lib/authz.ts).
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // A fresh token built from our own account row (found by Google's ID),
        // so nothing else Google sent -- the photo URL -- is carried along.
        try {
          const row = await prisma.user.findUnique({ where: { googleId: account.providerAccountId } });
          return row ? (accountClaims(row) as JWT) : ({} as JWT);
        } catch (err) {
          console.error(`[auth] database error building a Google login: ${describeDbError(err)}`);
          return {} as JWT;
        }
      }
      if (user) {
        const claims = user as unknown as Partial<ReturnType<typeof accountClaims>>;
        token.id = claims.id;
        token.username = claims.username;
        token.role = claims.role;
        token.passwordStamp = claims.passwordStamp ?? 0;
        token.needsUsername = claims.needsUsername ?? false;
      }
      // Until a new Google account picks its username, check on every session
      // read whether it has, so the proxy (which only sees the token) lets it
      // through as soon as it does.
      if (token.needsUsername && typeof token.id === "string") {
        try {
          const row = await prisma.user.findUnique({
            where: { id: token.id },
            select: { username: true, needsUsername: true },
          });
          if (row && !row.needsUsername) {
            token.needsUsername = false;
            token.username = row.username;
          }
        } catch (err) {
          console.error(`[auth] database error refreshing a login: ${describeDbError(err)}`);
        }
      }
      return token;
    },
    // Runs for every session read, server and client. A token whose account
    // has been suspended or deleted since login, or whose password has been
    // changed since, yields a session with no user, so pages, actions and the
    // navbar all treat it as signed out. If the check itself fails (database
    // unreachable), fail closed.
    async session({ session, token }) {
      let active: Awaited<ReturnType<typeof findActiveUser>> = null;
      try {
        active = token.id ? await findActiveUser(token.id as string) : null;
      } catch (err) {
        console.error(`[auth] database error checking a session: ${describeDbError(err)}`);
      }
      const stamp = token.passwordStamp as number | undefined;
      if (!active || !issuedForCurrentPassword(active, stamp)) return { expires: session.expires };
      session.user = {
        id: active.id,
        name: active.name,
        email: token.email ?? null,
        username: active.username,
        role: active.role,
        passwordStamp: stamp ?? 0,
        needsUsername: active.needsUsername,
      };
      return session;
    },
  },
};
