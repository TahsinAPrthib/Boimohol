import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { passwordStamp } from "@/lib/account-rules";

// A login token outlives the account it was issued for: the account may since
// have been suspended or deleted, or its password changed. So whether someone
// counts as signed in is decided here, from the database, on every request --
// never from the token alone. Used by the NextAuth session callback and by the
// session helpers in src/lib/authz.ts; cache() makes that one query per
// request in a render.
export const findActiveUser = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, suspendedAt: true, passwordChangedAt: true },
  });
  if (!user || user.suspendedAt) return null;
  return { id: user.id, name: user.name, role: user.role, passwordStamp: passwordStamp(user.passwordChangedAt) };
});

// A token (or the session built from it) still counts only if it was issued
// for the account's current password. Tokens from before this check existed
// carry no stamp, which reads as "never changed".
export function issuedForCurrentPassword(
  user: { passwordStamp: number },
  tokenStamp: number | null | undefined
): boolean {
  return user.passwordStamp === (tokenStamp ?? 0);
}
