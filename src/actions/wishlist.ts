"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import { evaluateMatch, type MatchStrength } from "@/lib/wishlist-match";

export type WishlistToggleResult = {
  success: boolean;
  message?: string;
  wishlisted?: boolean;
};

export async function toggleWishlist(bookId: string): Promise<WishlistToggleResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "উইশলিস্টে যোগ করতে হলে আগে লগইন করুন।" };
  }

  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true } });
  if (!book) {
    return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_bookId: { userId, bookId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId, bookId } });
  }

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/wishlist");

  return { success: true, wishlisted: !existing };
}

export type WishlistMatch = {
  listingId: string;
  listingTitle: string;
  listingAuthor: string;
  colorKey: string | null;
  listingType: "SELL" | "EXCHANGE" | "DONATE";
  price: number | null;
  location: string;
  // Which wishlisted book this listing appears to be.
  matchedBookId: string;
  matchedBookTitle: string;
  // "title-and-author" matches are the confident ones and sort first.
  strength: MatchStrength;
};

// The matching heuristic itself lives in src/lib/wishlist-match.ts so it can
// be tested directly; this function is the data plumbing around it.
export async function getWishlistMatches(): Promise<WishlistMatch[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { book: { select: { id: true, title: true, titleBangla: true, author: true } } },
  });
  if (wishlist.length === 0) return [];

  const blockedIds = await blockedIdsFor(userId);

  const listings = await prisma.listing.findMany({
    where: {
      status: "AVAILABLE",
      sellerId: { not: userId, ...(blockedIds.length > 0 ? { notIn: blockedIds } : {}) },
    },
    include: { category: { select: { colorKey: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (listings.length === 0) return [];

  const matches: WishlistMatch[] = [];
  const seen = new Set<string>();

  for (const item of wishlist) {
    for (const listing of listings) {
      const result = evaluateMatch(listing, item.book);
      if (!result.matched) continue;

      // A listing can match more than one wishlisted book; show it once.
      if (seen.has(listing.id)) continue;
      seen.add(listing.id);

      matches.push({
        listingId: listing.id,
        listingTitle: listing.title,
        listingAuthor: listing.author,
        colorKey: listing.category?.colorKey ?? null,
        listingType: listing.listingType,
        price: listing.price,
        location: listing.location,
        matchedBookId: item.book.id,
        matchedBookTitle: item.book.titleBangla || item.book.title,
        strength: result.strength,
      });
    }
  }

  // Title+author agreement is the stronger signal, so show those first;
  // listings are already newest-first within each group.
  return matches.sort((a, b) => {
    const rank = (s: MatchStrength) => (s === "title-and-author" ? 0 : 1);
    return rank(a.strength) - rank(b.strength);
  });
}
