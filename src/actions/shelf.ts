"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logReadingActivity } from "@/lib/streak";

const shelfSchema = z.object({
  bookId: z.string().min(1),
  status: z.enum(["WANT", "READING", "FINISHED"]),
});

export type ShelfState = {
  success: boolean;
  message?: string;
};

export async function updateShelfStatus(
  bookId: string,
  status: "WANT" | "READING" | "FINISHED"
): Promise<ShelfState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "বইতাকে যোগ করতে হলে আগে লগইন করুন।" };
  }

  const parsed = shelfSchema.safeParse({ bookId, status });
  if (!parsed.success) {
    return { success: false, message: "অনুরোধটি সঠিক নয়।" };
  }

  const finishedAt = parsed.data.status === "FINISHED" ? new Date() : undefined;

  await prisma.shelfItem.upsert({
    where: {
      userId_bookId: { userId: session.user.id, bookId: parsed.data.bookId },
    },
    update: {
      status: parsed.data.status,
      ...(finishedAt ? { finishedAt } : {}),
    },
    create: {
      userId: session.user.id,
      bookId: parsed.data.bookId,
      status: parsed.data.status,
      ...(finishedAt ? { finishedAt } : {}),
    },
  });

  // v1: any shelf status change counts toward the reading streak, not just
  // READING/FINISHED. Intentionally simple — tighten this if it turns out
  // to be easy to game for an inflated streak.
  await logReadingActivity(session.user.id);

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/profile");

  return { success: true };
}
