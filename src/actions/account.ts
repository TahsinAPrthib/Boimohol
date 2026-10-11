"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { describeDbError } from "@/lib/db-errors";
import { canDeleteOwnAccount, nameSchema, passwordSchema } from "@/lib/account-rules";
import { deleteAccount } from "@/lib/account-deletion";

// The signed-in user's own settings. Each action works only on the account
// the session belongs to -- nothing here takes a user id from the caller.

export type AccountField = "name" | "current" | "next" | "confirm" | "confirmation";

export type AccountResult = {
  success: boolean;
  message: string;
  // The input the message is about, so the form can mark it.
  field?: AccountField;
};

const SIGNED_OUT: AccountResult = { success: false, message: "এটি করতে হলে আগে লগইন করুন।" };
const SERVER_PROBLEM: AccountResult = {
  success: false,
  message: "সার্ভারে সাময়িক সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
};
const WRONG_PASSWORD: AccountResult = { success: false, message: "বর্তমান পাসওয়ার্ড সঠিক নয়।", field: "current" };

async function currentPasswordMatches(userId: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  return Boolean(user && password && (await bcrypt.compare(password, user.passwordHash)));
}

export async function updateDisplayName(name: string): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;

  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "নামটি সঠিক নয়।", field: "name" };
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { name: parsed.data } });
  } catch (err) {
    console.error(`[account] database error changing a name: ${describeDbError(err)}`);
    return SERVER_PROBLEM;
  }

  // The name is shown beside the user's reviews on every book page.
  revalidatePath("/", "layout");
  return { success: true, message: "নাম বদলানো হয়েছে।" };
}

// After this, every login token issued before it stops counting (see
// src/lib/account-rules.ts), so the user is signed out everywhere -- here
// too, until the settings page signs them back in with the new password.
export async function changePassword(current: string, next: string, confirm: string): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;

  if (!current) return { success: false, message: "বর্তমান পাসওয়ার্ড লিখুন।", field: "current" };
  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "পাসওয়ার্ডটি সঠিক নয়।", field: "next" };
  }
  if (next !== confirm) return { success: false, message: "নতুন পাসওয়ার্ড দুটি মিলছে না।", field: "confirm" };

  try {
    if (!(await currentPasswordMatches(userId, current))) return WRONG_PASSWORD;
    if (current === next) {
      return { success: false, message: "নতুন পাসওয়ার্ড আগেরটির মতোই। অন্য একটি দিন।", field: "next" };
    }
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(next, 10), passwordChangedAt: new Date() },
    });
  } catch (err) {
    console.error(`[account] database error changing a password: ${describeDbError(err)}`);
    return SERVER_PROBLEM;
  }

  return { success: true, message: "পাসওয়ার্ড বদলানো হয়েছে। অন্য সব ডিভাইস ও ব্রাউজার থেকে আপনাকে লগ আউট করা হয়েছে।" };
}

// Exactly what an admin's deletion does (src/lib/account-deletion.ts), minus
// the moderation log entry: this isn't moderation.
export async function deleteOwnAccount(currentPassword: string, confirmation: string): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true, role: true } });
    if (!user) return SIGNED_OUT;
    if (confirmation.trim() !== user.username) {
      return { success: false, message: "নিশ্চিত করতে ঠিক আপনার ইউজারনেমটিই লিখুন।", field: "confirmation" };
    }
    if (!(await currentPasswordMatches(userId, currentPassword))) return WRONG_PASSWORD;

    const otherActiveAdmins =
      user.role === "ADMIN"
        ? await prisma.user.count({ where: { role: "ADMIN", suspendedAt: null, id: { not: userId } } })
        : 0;
    if (!canDeleteOwnAccount(user.role, otherActiveAdmins)) {
      return {
        success: false,
        message: "আপনিই সাইটের একমাত্র সক্রিয় অ্যাডমিন, তাই আপনার অ্যাকাউন্ট মুছে ফেলা যাবে না।",
      };
    }
  } catch (err) {
    console.error(`[account] database error before deleting an account: ${describeDbError(err)}`);
    return SERVER_PROBLEM;
  }

  const result = await deleteAccount(userId, { note: "ব্যবহারকারী নিজেই অ্যাকাউন্টটি মুছে ফেলেছেন।" });
  if (!result.ok) return result.reason === "not-found" ? SIGNED_OUT : SERVER_PROBLEM;

  revalidatePath("/", "layout");
  return { success: true, message: "আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে।" };
}
