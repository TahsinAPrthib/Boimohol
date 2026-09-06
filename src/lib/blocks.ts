import { prisma } from "@/lib/prisma";

// Blocking is symmetric in effect: if either party has blocked the other,
// neither can start a conversation or send a message. Both call sites in
// src/actions/messages.ts go through this so the two directions can't drift
// apart.
export async function isBlockedEitherWay(userA: string, userB: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
    select: { id: true },
  });

  return block !== null;
}

export async function blockedIdsFor(userId: string): Promise<string[]> {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });

  return blocks.map((b) => b.blockedId);
}
