"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";

const reportSchema = z.object({
  targetType: z.enum(["LISTING", "MESSAGE", "USER"]),
  targetId: z.string().min(1),
  reason: z.enum(["SPAM", "HARASSMENT", "SCAM", "INAPPROPRIATE", "COPYRIGHT", "OTHER"]),
  details: z.string().trim().max(2000, "বিবরণ অনেক বড় হয়ে গেছে।").optional(),
});

export type ModerationResult = {
  success: boolean;
  message?: string;
};

type TargetType = "LISTING" | "MESSAGE" | "USER";

// Resolves who owns the reported thing, so a user can't report their own
// content. Returns null when the target doesn't exist.
async function resolveTargetOwner(
  targetType: TargetType,
  targetId: string
): Promise<{ ownerId: string } | null> {
  switch (targetType) {
    case "LISTING": {
      const listing = await prisma.listing.findUnique({
        where: { id: targetId },
        select: { sellerId: true },
      });
      return listing ? { ownerId: listing.sellerId } : null;
    }
    case "MESSAGE": {
      const message = await prisma.message.findUnique({
        where: { id: targetId },
        select: { senderId: true },
      });
      return message ? { ownerId: message.senderId } : null;
    }
    case "USER": {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      return user ? { ownerId: user.id } : null;
    }
  }
}

export async function submitReport(
  targetType: TargetType,
  targetId: string,
  reason: "SPAM" | "HARASSMENT" | "SCAM" | "INAPPROPRIATE" | "COPYRIGHT" | "OTHER",
  details?: string
): Promise<ModerationResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "রিপোর্ট করতে হলে আগে লগইন করুন।" };
  }

  const parsed = reportSchema.safeParse({ targetType, targetId, reason, details: details || undefined });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }

  const target = await resolveTargetOwner(parsed.data.targetType, parsed.data.targetId);
  if (!target) {
    return { success: false, message: "যেটি রিপোর্ট করতে চাইছেন সেটি খুঁজে পাওয়া যায়নি।" };
  }
  if (target.ownerId === userId) {
    return { success: false, message: "নিজের কনটেন্ট রিপোর্ট করা যাবে না।" };
  }

  const existing = await prisma.report.findFirst({
    where: {
      reporterId: userId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      status: "OPEN",
    },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      message: "আপনি এটি ইতিমধ্যে রিপোর্ট করেছেন — আমরা বিষয়টি দেখছি।",
    };
  }

  await prisma.report.create({
    data: {
      reporterId: userId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    },
  });

  revalidatePath("/admin/reports");

  return { success: true, message: "রিপোর্টটি জমা হয়েছে। ধন্যবাদ।" };
}

export async function blockUser(userId: string): Promise<ModerationResult> {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) {
    return { success: false, message: "ব্লক করতে হলে আগে লগইন করুন।" };
  }
  if (userId === currentUserId) {
    return { success: false, message: "নিজেকে ব্লক করা যাবে না।" };
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) {
    return { success: false, message: "ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।" };
  }

  // Upsert so blocking someone already blocked is a no-op, not an error.
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: userId } },
    update: {},
    create: { blockerId: currentUserId, blockedId: userId },
  });

  revalidatePath("/marketplace");
  revalidatePath("/messages");

  return { success: true, message: "ব্যবহারকারীকে ব্লক করা হয়েছে।" };
}

export async function unblockUser(userId: string): Promise<ModerationResult> {
  const currentUserId = await getSessionUserId();
  if (!currentUserId) {
    return { success: false, message: "আনব্লক করতে হলে আগে লগইন করুন।" };
  }

  // deleteMany rather than delete so unblocking someone who isn't blocked
  // succeeds quietly instead of throwing.
  await prisma.block.deleteMany({
    where: { blockerId: currentUserId, blockedId: userId },
  });

  revalidatePath("/marketplace");
  revalidatePath("/messages");

  return { success: true, message: "ব্লক তুলে নেওয়া হয়েছে।" };
}

export async function getBlockedUserIds(): Promise<string[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  return blockedIdsFor(userId);
}
