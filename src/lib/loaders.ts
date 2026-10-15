import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Per-request memoised loaders for the records a route can 404 on.
//
// A route's layout calls one before the route's loading skeleton streams, so
// a missing record still gets a real 404 status (once the skeleton has been
// sent, the status is already 200). The page then calls the same loader and
// React's cache() returns the same result -- the record is fetched once.
// Each query is the page's own; keep them in step with what the pages use.

export const loadBook = cache((id: string) =>
  prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
      // Only a verified free file is ever surfaced to readers.
      files: {
        where: { type: "FREE", rightsVerified: true },
        select: { id: true, publicId: true, fileSizeBytes: true, rightsBasis: true },
        take: 1,
      },
      sources: {
        select: { id: true, kind: true, url: true, rightsBasis: true },
        orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
      },
      reviews: {
        include: { user: { select: { id: true, name: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
);

export const loadCategory = cache((slug: string) =>
  prisma.category.findUnique({
    where: { slug },
    include: {
      // The page loads its own books, a page at a time.
      starterPicks: {
        include: { book: { include: { reviews: { select: { rating: true } } } } },
        orderBy: { rank: "asc" },
        take: 1,
      },
    },
  })
);

// Used by both the listing page and its edit page.
export const loadListing = cache((id: string) =>
  prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      seller: true,
      photos: { orderBy: { order: "asc" }, select: { id: true, publicId: true } },
    },
  })
);

export const loadRequest = cache((id: string) =>
  prisma.bookRequest.findUnique({
    where: { id },
    include: {
      category: { select: { nameBangla: true, slug: true } },
      requester: { select: { id: true, username: true } },
      responses: {
        include: { responder: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })
);

export const loadConversation = cache((id: string) =>
  prisma.conversation.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, username: true } },
      listing: { include: { category: true, seller: { select: { id: true, username: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  })
);

export const loadProfileUser = cache((userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    include: {
      shelfItems: {
        include: { book: { include: { category: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  })
);
