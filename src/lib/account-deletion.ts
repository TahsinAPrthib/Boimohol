import "server-only";
import type { PrismaPromise } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serverCloudinary } from "@/lib/cloudinary-server";
import { resolveReports, runSteps } from "@/lib/moderation-db";

export type AccountDeletionResult =
  | { ok: true; username: string }
  | { ok: false; reason: "not-found" | "failed" };

// Deletes the account and everything that is only theirs: listings (and
// their photos, here and on Cloudinary), reviews, book requests (with the
// replies to them), replies they wrote, shelf, wishlist, reading activity and
// blocks. What other people hold is kept: messages they received stay in the
// conversation, shown as from a deleted user (Message.senderId, like
// Conversation.buyerId/listingId and Report.reporterId, becomes NULL).
//
// The one path for both an admin deleting someone and a user deleting
// themselves, so the two can't drift apart. Callers check who may do it;
// `note` closes the open reports about the account and its content, and
// `extraSteps` (the admin's moderation log entry) commit in the same
// transaction. The privacy page describes exactly this -- keep it in step.
export async function deleteAccount(
  userId: string,
  { note, extraSteps = () => [] }: { note: string; extraSteps?: (user: { id: string; username: string }) => PrismaPromise<unknown>[] }
): Promise<AccountDeletionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      listings: { select: { id: true, photos: { select: { publicId: true } } } },
      messagesSent: { select: { id: true } },
    },
  });
  if (!user) return { ok: false, reason: "not-found" };

  const listingIds = user.listings.map((l) => l.id);
  const photoIds = user.listings.flatMap((l) => l.photos.map((p) => p.publicId));
  const resolved = await resolveReports(
    undefined,
    [
      { type: "USER", ids: [user.id] },
      { type: "LISTING", ids: listingIds },
      { type: "MESSAGE", ids: user.messagesSent.map((m) => m.id) },
    ],
    note
  );

  // A conversation where the other person's account is already gone has no
  // one left to read it once this one goes too.
  const orphaned = { buyerId: null, listingId: null };

  const ok = await runSteps(
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
      ...extraSteps({ id: user.id, username: user.username }),
      prisma.user.delete({ where: { id: user.id } }),
      prisma.message.deleteMany({ where: { conversation: orphaned } }),
      prisma.conversation.deleteMany({ where: orphaned }),
    ],
    "deleting an account"
  );
  if (!ok) return { ok: false, reason: "failed" };

  // After the commit, so a failed delete never leaves rows pointing at
  // images that are gone. A failed remote delete only leaves an orphaned
  // image behind; the account is gone either way.
  const cloudinary = serverCloudinary();
  const destroyed = await Promise.allSettled(photoIds.map((id) => cloudinary.uploader.destroy(id)));
  const failed = destroyed.filter((d) => d.status === "rejected" || d.value?.result !== "ok").length;
  if (failed > 0) console.error(`[account] ${failed} of ${photoIds.length} listing photos not deleted from Cloudinary`);

  return { ok: true, username: user.username };
}
