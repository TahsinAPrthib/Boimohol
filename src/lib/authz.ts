import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withCallbackUrl } from "@/lib/safe-redirect";

// One session read per request, however many layouts and pages ask for it.
// (Outside a render, e.g. in a server action, cache() simply doesn't memoise.)
const getSession = cache(() => getServerSession(authOptions));

// The single place session-gating is expressed, so actions and pages agree
// on what "logged in" means.
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

// For the layout of a signed-in-only route. Layouts render before the route's
// loading.tsx skeleton is streamed, so the redirect here is a real 307; the
// same redirect inside the page would arrive after the 200 had been sent.
export async function requireUserId(callbackPath: string): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) redirect(withCallbackUrl("/login", callbackPath));
  return userId;
}

// Deliberately re-reads role from the database instead of trusting
// session.user.role: the JWT is minted at login, so a user demoted from
// ADMIN would otherwise keep admin powers until their token expired. The
// session copy of role is for showing/hiding UI only.
export async function getAdminUserId(): Promise<string | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN" ? userId : null;
}
