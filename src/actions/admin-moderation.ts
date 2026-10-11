"use server";

import { revalidatePath } from "next/cache";
import type { Prisma, PrismaPromise, ReportTargetType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { serverCloudinary } from "@/lib/cloudinary-server";
import { describeDbError } from "@/lib/db-errors";
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

// Updates that close the reports a step answers: the one it was taken from,
// plus any other open report about the same thing (removing a listing
// settles every report about it). An existing admin note is kept.
async function resolveReports(
  reportId: string | undefined,
  targets: { type: ReportTargetType; ids: string[] }[],
  note: string
): Promise<{ reportId: string | null; updates: PrismaPromise<unknown>[] }> {
  const or: Prisma.ReportWhereInput[] = targets
    .filter((t) => t.ids.length > 0)
    .map((t) => ({ targetType: t.type, targetId: { in: t.ids } }));
  if (reportId) or.push({ id: reportId });
  if (or.length === 0) return { reportId: null, updates: [] };

  const reports = await prisma.report.findMany({
    where: { OR: or, status: { in: ["OPEN", "REVIEWING"] } },
    select: { id: true, adminNote: true },
  });
  const known = reportId ? await prisma.report.findUnique({ where: { id: reportId }, select: { id: true } }) : null;
  return {
    reportId: known?.id ?? null,
    updates: reports.map((r) =>
      prisma.report.update({
        where: { id: r.id },
        data: { status: "RESOLVED", adminNote: r.adminNote || note },
      })
    ),
  };
}

async function run(steps: PrismaPromise<unknown>[], what: string): Promise<boolean> {
  try {
    await prisma.$transaction(steps);
    return true;
  } catch (err) {
    console.error(`[admin] ${what} failed: ${describeDbError(err)}`);
    return false;
  }
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
    if (!(await run(resolved.updates, "resolving reports"))) return FAILED;
    revalidatePath("/admin/reports");
    return { success: true, message: "তালিকাটি আগেই সরানো হয়েছিল।" };
  }

  const ok = await run(
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

  const ok = await run(
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

  const ok = await run(
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
    if (!(await run(resolved.updates, "resolving a report"))) return FAILED;
    revalidatePath("/admin", "layout");
    return { success: true, message: "অ্যাকাউন্টটি আগেই স্থগিত করা হয়েছিল।" };
  }

  const ok = await run(
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

  const ok = await run(
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

// Deletes the account and everything that is only theirs: listings (and
// their photos, here and on Cloudinary), reviews, book requests (with the
// replies to them), replies they wrote, shelf, wishlist, reading activity and
// blocks. What other people hold is kept: messages they received stay in the
// conversation, shown as from a deleted user (Message.senderId, like
// Conversation.buyerId/listingId and Report.reporterId, becomes NULL).
export async function deleteUserAccount(userId: string): Promise<AdminResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return NOT_ALLOWED;
  if (userId === adminId) return { success: false, message: "নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না।" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      listings: { select: { id: true, photos: { select: { publicId: true } } } },
      messagesSent: { select: { id: true } },
    },
  });
  if (!user) return { success: false, message: "ব্যবহারকারীকে খুঁজে পাওয়া যায়নি।" };

  const listingIds = user.listings.map((l) => l.id);
  const photoIds = user.listings.flatMap((l) => l.photos.map((p) => p.publicId));
  const resolved = await resolveReports(
    undefined,
    [
      { type: "USER", ids: [user.id] },
      { type: "LISTING", ids: listingIds },
      { type: "MESSAGE", ids: user.messagesSent.map((m) => m.id) },
    ],
    "অ্যাডমিন অ্যাকাউন্টটি মুছে ফেলেছেন।"
  );

  // A conversation where the other person's account is already gone has no
  // one left to read it once this one goes too.
  const orphaned = { buyerId: null, listingId: null };

  const ok = await run(
    [
      prisma.requestResponse.deleteMany({
        where: { OR: [{ responderId: user.id }, { request: { requesterId: user.id } }] },
      }),
      prisma.bookRequest.deleteMany({ where: { requesterId: user.id } }),
      prisma.review.deleteMany({ where: { userId: user.id } }),
      prisma.shelfItem.deleteMany({ where: { userId: user.id } }),
      prisma.wishlistItem.deleteMany({ where: { userId: user.id } }),
      prisma.readingActivity.deleteMany({ where: { userId: user.id } }),
      prisma.block.deleteMany({ where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] } }),
      // Photos go with them (cascade); conversations about them stay.
      prisma.listing.deleteMany({ where: { sellerId: user.id } }),
      ...resolved.updates,
      prisma.moderationAction.create({
        data: {
          adminId,
          action: "DELETE_USER",
          targetId: user.id,
          summary: `@${user.username}`,
        },
      }),
      prisma.user.delete({ where: { id: user.id } }),
      prisma.message.deleteMany({ where: { conversation: orphaned } }),
      prisma.conversation.deleteMany({ where: orphaned }),
    ],
    "deleting an account"
  );
  if (!ok) return FAILED;

  // After the commit, so a failed delete never leaves rows pointing at
  // images that are gone. A failed remote delete only leaves an orphaned
  // image behind; the account is gone either way.
  const cloudinary = serverCloudinary();
  const destroyed = await Promise.allSettled(photoIds.map((id) => cloudinary.uploader.destroy(id)));
  const failed = destroyed.filter((d) => d.status === "rejected" || d.value?.result !== "ok").length;
  if (failed > 0) console.error(`[admin] ${failed} of ${photoIds.length} listing photos not deleted from Cloudinary`);

  revalidateEverything();
  return { success: true, message: `@${user.username} এর অ্যাকাউন্ট মুছে ফেলা হয়েছে।` };
}
