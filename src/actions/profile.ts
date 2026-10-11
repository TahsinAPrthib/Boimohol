"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";

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
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "লক্ষ্য নির্ধারণ করতে হলে আগে লগইন করুন।" };
  }

  const parsed = goalSchema.safeParse(goal);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "সঠিক সংখ্যা দিন।" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { yearlyGoal: parsed.data },
  });

  revalidatePath("/profile");

  return { success: true };
}
