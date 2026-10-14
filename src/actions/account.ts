"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getPendingUserId, getSessionUserId } from "@/lib/authz";
import { describeDbError } from "@/lib/db-errors";
import { canDeleteOwnAccount, nameSchema, passwordSchema, usernameSchema } from "@/lib/account-rules";
import { deleteAccount } from "@/lib/account-deletion";
import { setGoogleLinkIntent } from "@/lib/google-auth";

// The signed-in user's own settings. Each action works only on the account
// the session belongs to -- nothing here takes a user id from the caller.

export type AccountField = "name" | "username" | "current" | "next" | "confirm" | "confirmation";

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

// The account's password hash: null when it has none (created through Google).
async function passwordHashOf(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  return user?.passwordHash ?? null;
}

// A new Google account's first step, and the only thing it can do until done.
export async function chooseUsername(username: string): Promise<AccountResult> {
  const userId = await getPendingUserId();
  if (!userId) return { success: false, message: "এই অ্যাকাউন্টের ইউজারনেম আগেই বেছে নেওয়া হয়েছে।" };

  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "ইউজারনেমটি সঠিক নয়।", field: "username" };
  }

  try {
    const taken = await prisma.user.findUnique({ where: { username: parsed.data }, select: { id: true } });
    if (taken) return { success: false, message: "এই ইউজারনেমটি আগে থেকেই নেওয়া হয়েছে।", field: "username" };
    // Only while it is still pending, so a second submit can't rename it.
    const { count } = await prisma.user.updateMany({
      where: { id: userId, needsUsername: true },
      data: { username: parsed.data, needsUsername: false },
    });
    if (count === 0) return { success: false, message: "এই অ্যাকাউন্টের ইউজারনেম আগেই বেছে নেওয়া হয়েছে।" };
  } catch (err) {
    // Someone took it between the check and the update.
    if ((err as { code?: string }).code === "P2002") {
      return { success: false, message: "এই ইউজারনেমটি আগে থেকেই নেওয়া হয়েছে।", field: "username" };
    }
    console.error(`[account] database error choosing a username: ${describeDbError(err)}`);
    return SERVER_PROBLEM;
  }

  return { success: true, message: `স্বাগতম, @${parsed.data}!` };
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

// Changes the password -- or, for an account created through Google that has
// none, sets the first one (no current password to ask for). After this,
// every login token issued before it stops counting (see
// src/lib/account-rules.ts), so the user is signed out everywhere -- here too,
// until the settings page signs them back in with the new password.
export async function changePassword(current: string, next: string, confirm: string): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;

  try {
    const hash = await passwordHashOf(userId);
    if (hash && !current) return { success: false, message: "বর্তমান পাসওয়ার্ড লিখুন।", field: "current" };
    const parsed = passwordSchema.safeParse(next);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "পাসওয়ার্ডটি সঠিক নয়।", field: "next" };
    }
    if (next !== confirm) return { success: false, message: "নতুন পাসওয়ার্ড দুটি মিলছে না।", field: "confirm" };

    if (hash) {
      if (!(await bcrypt.compare(current, hash))) return WRONG_PASSWORD;
      if (current === next) {
        return { success: false, message: "নতুন পাসওয়ার্ড আগেরটির মতোই। অন্য একটি দিন।", field: "next" };
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(next, 10), passwordChangedAt: new Date() },
    });
    return {
      success: true,
      message: hash
        ? "পাসওয়ার্ড বদলানো হয়েছে। অন্য সব ডিভাইস ও ব্রাউজার থেকে আপনাকে লগ আউট করা হয়েছে।"
        : "পাসওয়ার্ড ঠিক করা হয়েছে। এখন ইমেইল ও পাসওয়ার্ড দিয়েও লগইন করতে পারবেন।",
    };
  } catch (err) {
    console.error(`[account] database error changing a password: ${describeDbError(err)}`);
    return SERVER_PROBLEM;
  }
}

// Step one of "Connect Google": mark that this account asked, then the page
// sends the browser to Google. The link itself is made on the way back, in
// src/lib/google-auth.ts.
export async function startGoogleConnect(): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { googleId: true } });
  if (user?.googleId) return { success: false, message: "আপনার অ্যাকাউন্টে আগে থেকেই Google যুক্ত আছে।" };
  await setGoogleLinkIntent(userId);
  return { success: true, message: "" };
}

// Refused while the account has no password: Google would be its only way in.
export async function disconnectGoogle(): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { googleId: true, passwordHash: true } });
    if (!user?.googleId) return { success: false, message: "আপনার অ্যাকাউন্টে কোনো Google অ্যাকাউন্ট যুক্ত নেই।" };
    if (!user.passwordHash) {
      return {
        success: false,
        message: "আগে একটি পাসওয়ার্ড ঠিক করুন — না হলে Google সরিয়ে দেওয়ার পর আর লগইন করতে পারবেন না।",
      };
    }
    await prisma.user.update({ where: { id: userId }, data: { googleId: null } });
  } catch (err) {
    console.error(`[account] database error disconnecting Google: ${describeDbError(err)}`);
    return SERVER_PROBLEM;
  }
  return { success: true, message: "Google অ্যাকাউন্টটি সরিয়ে দেওয়া হয়েছে। এখন ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করবেন।" };
}

// Exactly what an admin's deletion does (src/lib/account-deletion.ts), minus
// the moderation log entry: this isn't moderation. An account with a password
// confirms with it; one created through Google that has none confirms with
// the typed username alone.
export async function deleteOwnAccount(currentPassword: string, confirmation: string): Promise<AccountResult> {
  const userId = await getSessionUserId();
  if (!userId) return SIGNED_OUT;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, role: true, passwordHash: true },
    });
    if (!user) return SIGNED_OUT;
    if (confirmation.trim() !== user.username) {
      return { success: false, message: "নিশ্চিত করতে ঠিক আপনার ইউজারনেমটিই লিখুন।", field: "confirmation" };
    }
    if (user.passwordHash && !(currentPassword && (await bcrypt.compare(currentPassword, user.passwordHash)))) {
      return WRONG_PASSWORD;
    }

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
