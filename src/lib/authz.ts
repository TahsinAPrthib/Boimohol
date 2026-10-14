import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withCallbackUrl } from "@/lib/safe-redirect";
import { findActiveUser, issuedForCurrentPassword } from "@/lib/account-status";

// One session read per request, however many layouts and pages ask for it.
// (Outside a render, e.g. in a server action, cache() simply doesn't memoise.)
const getSession = cache(() => getServerSession(authOptions));

// The account behind the current login: a valid login token, for an account
// that still exists and isn't suspended, issued since its password was last
// changed. (The session callback already drops such a user; this checks again
// so no caller depends on that alone. Within a render both share one cached
// lookup.)
async function sessionAccount() {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return null;
  const active = await findActiveUser(userId);
  return active && issuedForCurrentPassword(active, session.user.passwordStamp) ? active : null;
}

// The single place session-gating is expressed, so actions and pages agree
// on what "logged in" means. An account that still has to choose a username
// (a new Google sign-up) doesn't count yet: until it does, every action and
// page treats it as signed out, whatever the UI shows.
export async function getSessionUserId(): Promise<string | null> {
  const account = await sessionAccount();
  return account && !account.needsUsername ? account.id : null;
}

// Only for choosing that username: the one thing such an account can do.
export async function getPendingUserId(): Promise<string | null> {
  const account = await sessionAccount();
  return account?.needsUsername ? account.id : null;
}

// For the layout of a signed-in-only route. Layouts render before the route's
// loading.tsx skeleton is streamed, so the redirect here is a real 307; the
// same redirect inside the page would arrive after the 200 had been sent.
export async function requireUserId(callbackPath: string): Promise<string> {
  const account = await sessionAccount();
  if (account?.needsUsername) redirect(withCallbackUrl("/welcome", callbackPath));
  if (!account) redirect(withCallbackUrl("/login", callbackPath));
  return account.id;
}

// Deliberately re-reads role from the database instead of trusting
// session.user.role: the JWT is minted at login, so a user demoted from
// ADMIN would otherwise keep admin powers until their token expired. The
// session copy of role is for showing/hiding UI only.
export async function getAdminUserId(): Promise<string | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return (await findActiveUser(userId))?.role === "ADMIN" ? userId : null;
}
