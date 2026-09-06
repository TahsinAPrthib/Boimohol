import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// The single place session-gating is expressed, so actions and pages agree
// on what "logged in" means.
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
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
