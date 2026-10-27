import "server-only";
import type { Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { banglaFirst, splitPage } from "@/lib/book-language";

// The order of the library and the category pages: the curated books first
// (Bangla first, by the title readers see), then the books imported in bulk
// from a whole catalog, by title (Book.sortTitle: leading quote marks and
// symbols, case and accents don't count). Only one page of the bulk books is
// ever read: the database sorts and pages them (the curated + sortTitle
// indexes), so a page stays quick with tens of thousands of books.
export async function curatedFirstPage(
  where: Prisma.BookWhereInput,
  page: number,
  { cacheCount }: { cacheCount: boolean }
): Promise<{ ids: string[]; page: number; pages: number }> {
  const curatedWhere = { AND: [where, { curated: true }] };
  const restWhere = { AND: [where, { curated: false }] };
  const [curated, restCount] = await Promise.all([
    prisma.book.findMany({ where: curatedWhere, select: { id: true, title: true, titleBangla: true, language: true } }),
    cacheCount ? bulkCount(restWhere) : prisma.book.count({ where: restWhere }),
  ]);
  const ordered = banglaFirst(curated).map((b) => b.id);
  const slice = splitPage(ordered.length, restCount, page);
  const rest =
    slice.rest.take > 0
      ? await prisma.book.findMany({
          where: restWhere,
          orderBy: [{ sortTitle: "asc" }, { id: "asc" }],
          skip: slice.rest.skip,
          take: slice.rest.take,
          select: { id: true },
        })
      : [];
  return { ids: [...ordered.slice(...slice.curated), ...rest.map((b) => b.id)], page: slice.page, pages: slice.pages };
}

const BOOK_COUNTS_TAG = "book-counts";

// How many bulk books a listing has, for its pager. Counting reads every one
// of them: a few milliseconds while the database is warm, but about half a
// second on the first visit after Neon wakes from sleep. So the number is
// kept in Next's data cache, shared by every server instance, per listing
// (the library and each category, by language; the arguments are the key).
// A listing narrowed by a search isn't cached: each query would be an entry,
// and the trigram index serves its count.
const bulkCount = unstable_cache(async (where: Prisma.BookWhereInput) => prisma.book.count({ where }), ["bulk-book-count"], {
  tags: [BOOK_COUNTS_TAG],
  revalidate: 3600,
});

// After anything that changes which books a listing has (a book added,
// edited or removed; a link or a free PDF added or removed): the cached
// counts go stale. The next visit still gets the old number at once, and the
// count is redone behind it, so no reader waits for it.
export function revalidateBookCounts() {
  revalidateTag(BOOK_COUNTS_TAG, "max");
}
