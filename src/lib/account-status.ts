import { cache } from "react";
import { prisma } from "@/lib/prisma";

// A login token outlives the account it was issued for: the account may since
// have been suspended or deleted. So whether someone counts as signed in is
// decided here, from the database, on every request -- never from the token
// alone. Used by the NextAuth session callback and by the session helpers in
// src/lib/authz.ts; cache() makes that one query per request in a render.
export const findActiveUser = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, suspendedAt: true },
  });
  if (!user || user.suspendedAt) return null;
  return { id: user.id, role: user.role };
});
