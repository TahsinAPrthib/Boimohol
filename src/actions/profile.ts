"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const goalSchema = z.coerce
  .number({ invalid_type_error: "সঠিক একটি সংখ্যা দিন।" })
  .int()
  .min(1, "লক্ষ্য কমপক্ষে ১ হতে হবে।")
  .max(500, "লক্ষ্য সর্বোচ্চ ৫০০ হতে পারে।");

export type SetGoalState = {
  success: boolean;
  message?: string;
};

export async function setYearlyGoal(goal: number): Promise<SetGoalState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "লক্ষ্য নির্ধারণ করতে হলে আগে লগইন করুন।" };
  }

  const parsed = goalSchema.safeParse(goal);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "সঠিক সংখ্যা দিন।" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { yearlyGoal: parsed.data },
  });

  revalidatePath("/profile");

  return { success: true };
}
