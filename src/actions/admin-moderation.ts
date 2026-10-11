"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { resolveReports, runSteps } from "@/lib/moderation-db";
import { deleteAccount } from "@/lib/account-deletion";
import type { AdminResult } from "@/actions/admin";

// Every action here re-checks the caller is an admin (a server action is a
// public endpoint), records who did what in ModerationAction, and -- when
// taken from the report queue -- resolves that report in the same step.

const NOT_ALLOWED: AdminResult = { success: false, message: "এই কাজটি করার অনুমতি আপনার নেই।" };
const FAILED: AdminResult = { success: false, message: "কাজটি সম্পন্ন করা যায়নি। একটু পরে আবার চেষ্টা করুন।" };

// Moderation is rare and what it removes shows up in many places (home,
// library ratings, search, the marketplace, profiles), so refresh them all.
function revalidateEverything() {
  revalidatePath("/", "layout");
}

export async function adminRemoveListing(listingId: string, reportId?: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, sellerId: true, removedByAdminAt: true },
  });
  if (!listing) return { success: false, message: "তালিকাটি খুঁজে পাওয়া যায়নি।" };

  const note = "অ্যাডমিন তালিকাটি সরিয়ে দিয়েছেন।";
  const resolved = await resolveReports(reportId, [{ type: "LISTING", ids: [listing.id] }], note);

  // Already removed (say, from another report about it): just close the
  // reports, keeping the original removal's who and when.
  if (listing.removedByAdminAt) {
    if (!(await runSteps(resolved.updates, "resolving reports"))) return FAILED;
    revalidatePath("/admin/reports");
    return { success: true, message: "তালিকাটি আগেই সরানো হয়েছিল।" };
  }

  const ok = await runSteps(
    [
      prisma.listing.update({
        where: { id: listing.id },
        data: { status: "REMOVED", removedByAdminAt: new Date(), removedByAdminId: adminId },
      }),
      prisma.moderationAction.create({
        data: {
          adminId,
          action: "REMOVE_LISTING",
          targetUserId: listing.sellerId,
          targetId: listing.id,
          summary: `“${listing.title}”`,
          reportId: resolved.reportId,
        },
      }),
      ...resolved.updates,
    ],
    "removing a listing"
  );
  if (!ok) return FAILED;

  revalidateEverything();
  return { success: true, message: "তালিকাটি সরিয়ে ফেলা হয়েছে।" };
}

export async function adminDeleteReview(reviewId: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, rating: true, book: { select: { title: true, titleBangla: true } } },
  });
  if (!review) return { success: false, message: "পর্যালোচনাটি খুঁজে পাওয়া যায়নি।" };

  const ok = await runSteps(
    [
      prisma.review.delete({ where: { id: review.id } }),
      prisma.moderationAction.create({
        data: {
          adminId,
          action: "DELETE_REVIEW",
          targetUserId: review.userId,
          targetId: review.id,
          summary: `“${review.book.titleBangla || review.book.title}” বইয়ের পর্যালোচনা`,
        },
      }),
    ],
    "deleting a review"
  );
  if (!ok) return FAILED;

  revalidateEverything();
  return { success: true, message: "পর্যালোচনাটি মুছে ফেলা হয়েছে।" };
}

export async function adminDeleteRequest(requestId: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;

  const request = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    select: { id: true, requesterId: true, title: true },
  });
  if (!request) return { success: false, message: "অনুরোধটি খুঁজে পাওয়া যায়নি।" };

  const ok = await runSteps(
    [
      // Other people's replies hang off the request, so they go with it.
      prisma.requestResponse.deleteMany({ where: { requestId: request.id } }),
      prisma.bookRequest.delete({ where: { id: request.id } }),
      prisma.moderationAction.create({
        data: {
          adminId,
          action: "DELETE_REQUEST",
          targetUserId: request.requesterId,
          targetId: request.id,
          summary: `“${request.title}” বইয়ের অনুরোধ`,
        },
      }),
    ],
    "deleting a request"
  );
  if (!ok) return FAILED;

  revalidateEverything();
  return { success: true, message: "অনুরোধটি মুছে ফেলা হয়েছে।" };
}

export async function suspendUser(userId: string, reportId?: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;
  if (userId === adminId) return { success: false, message: "নিজের অ্যাকাউন্ট স্থগিত করা যাবে না।" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, suspendedAt: true },
  });
  if (!user) return { success: false, message: "ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।" };

  // Only the report it was taken from: a suspension doesn't by itself
  // settle what other reports say about this person's content.
  const resolved = await resolveReports(reportId, [], "অ্যাডমিন অ্যাকাউন্টটি স্থগিত করেছেন।");

  if (user.suspendedAt) {
    if (!(await runSteps(resolved.updates, "resolving a report"))) return FAILED;
    revalidatePath("/admin", "layout");
    return { success: true, message: "অ্যাকাউন্টটি আগেই স্থগিত করা হয়েছিল।" };
  }

  const ok = await runSteps(
    [
      prisma.user.update({
        where: { id: user.id },
        data: { suspendedAt: new Date(), suspendedById: adminId },
      }),
      prisma.moderationAction.create({
        data: {
          adminId,
          action: "SUSPEND_USER",
          targetUserId: user.id,
          targetId: user.id,
          summary: `@${user.username}`,
          reportId: resolved.reportId,
        },
      }),
      ...resolved.updates,
    ],
    "suspending a user"
  );
  if (!ok) return FAILED;

  revalidateEverything();
  return { success: true, message: `@${user.username} এর অ্যাকাউন্ট স্থগিত করা হয়েছে।` };
}

export async function unsuspendUser(userId: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, suspendedAt: true },
  });
  if (!user) return { success: false, message: "ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।" };
  if (!user.suspendedAt) return { success: true, message: "অ্যাকাউন্টটি স্থগিত নয়।" };

  const ok = await runSteps(
    [
      prisma.user.update({ where: { id: user.id }, data: { suspendedAt: null, suspendedById: null } }),
      prisma.moderationAction.create({
        data: {
          adminId,
          action: "UNSUSPEND_USER",
          targetUserId: user.id,
          targetId: user.id,
          summary: `@${user.username}`,
        },
      }),
    ],
    "unsuspending a user"
  );
  if (!ok) return FAILED;

  revalidateEverything();
  return { success: true, message: `@${user.username} এর স্থগিতাদেশ তুলে নেওয়া হয়েছে।` };
}

// Deletes the account and everything only it owns, as described in
// src/lib/account-deletion.ts (the same path a user deleting themselves
// takes), and logs who did it.
export async function deleteUserAccount(userId: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;
  if (userId === adminId) return { success: false, message: "নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না।" };

  const result = await deleteAccount(userId, {
    note: "অ্যাডমিন অ্যাকাউন্টটি মুছে ফেলেছেন।",
    extraSteps: (user) => [
      prisma.moderationAction.create({
        data: { adminId, action: "DELETE_USER", targetId: user.id, summary: `@${user.username}` },
      }),
    ],
  });
  if (!result.ok) {
    return result.reason === "not-found" ? { success: false, message: "ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।" } : FAILED;
  }

  revalidateEverything();
  return { success: true, message: `@${result.username} এর অ্যাকাউন্ট মুছে ফেলা হয়েছে।` };
}
