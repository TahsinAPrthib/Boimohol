import "server-only";
import { revalidateTag, unstable_cache, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { publicDomainCutoffYear } from "@/lib/public-domain";
import { readerSource } from "@/lib/reader/source";
import { dayNumber, rotation, takeFrom } from "@/lib/daily";

// The shelves on the home page and the book pages, and the home page's book
// of the day (আজকের বই). Kept in Next's data cache, so a visit doesn't touch
// the database: the day's choice once per Dhaka date (the date is the key),
// a category's shelf once per category, both redone at most every few hours
// and whenever a book's cover, links or files change (revalidateShelves).

const SHELVES_TAG = "book-shelves";
const HOURS = 3600;

export function revalidateShelves() {
  revalidateTag(SHELVES_TAG, "max");
}

// After an admin's edit to a book (a server action only): the next visit
// waits for the new choice instead of being served the old one, so a book
// kept off the home page is gone from it at once.
export function expireShelves() {
  updateTag(SHELVES_TAG);
}

const shelfSelect = {
  id: true,
  title: true,
  titleBangla: true,
  author: true,
  coverPublicId: true,
  category: { select: { slug: true, colorKey: true } },
} as const;

// A book that may be offered free today: it passes the public-domain rule
// and there is a free copy, here or linked.
const free = () => ({
  isPublicDomain: true,
  authorDeathYear: { lte: publicDomainCutoffYear() },
  OR: [{ sources: { some: {} } }, { files: { some: {} } }],
});

async function shelfBooks(ids: string[]) {
  const rows = await prisma.book.findMany({ where: { id: { in: ids } }, select: shelfSelect });
  const byId = new Map(rows.map((b) => [b.id, b]));
  return ids.map((id) => byId.get(id)).filter((b) => b !== undefined);
}

async function chooseForDay(dateKey: string) {
  const day = dayNumber(dateKey);
  // The day's book has a real scanned cover (covers are only ever scans of
  // the book's own public-domain edition). Bangla books first: the other
  // languages only if no Bangla book qualifies.
  // (A book an admin has kept off the home page never comes up.)
  const scanned = await prisma.book.findMany({
    where: { ...free(), curated: true, hideFromHome: false, coverPublicId: { not: null } },
    select: { id: true, language: true },
  });
  const bangla = scanned.filter((b) => b.language === "bn");
  const order = rotation((bangla.length > 0 ? bangla : scanned).map((b) => b.id));
  if (order.length === 0) return null;
  const [todayId, ...comingIds] = takeFrom(order, day, 6);

  // The shelf behind it: the next days' books (scans) between curated
  // Bangla books in their drawn series covers, five of each (enough for a
  // wide screen; every cover is more page to load and hydrate).
  const drawn = rotation(
    (
      await prisma.book.findMany({
        where: { ...free(), curated: true, hideFromHome: false, language: "bn", coverPublicId: null },
        select: { id: true },
      })
    ).map((b) => b.id)
  );
  const drawnIds = takeFrom(drawn, day * 5, 5);
  const shelfIds: string[] = [];
  for (let i = 0; i < Math.max(comingIds.length, drawnIds.length); i++) {
    if (comingIds[i]) shelfIds.push(comingIds[i]);
    if (drawnIds[i]) shelfIds.push(drawnIds[i]);
  }

  const book = await prisma.book.findUnique({
    where: { id: todayId },
    select: {
      ...shelfSelect,
      translator: true,
      description: true,
      isPublicDomain: true,
      authorDeathYear: true,
      category: { select: { slug: true, colorKey: true, nameBangla: true } },
      sources: { select: { kind: true, url: true } },
    },
  });
  if (!book) return null;
  return {
    book: {
      id: book.id,
      title: book.title,
      titleBangla: book.titleBangla,
      author: book.author,
      translator: book.translator,
      description: book.description,
      coverPublicId: book.coverPublicId,
      category: book.category,
      // "Read today's book" opens the in-site reader when there is one.
      readHref: readerSource(book) ? `/books/${encodeURIComponent(book.id)}/read` : null,
    },
    shelf: await shelfBooks(shelfIds),
  };
}

export const loadTodaysShelf = unstable_cache(chooseForDay, ["todays-shelf-v2"], { tags: [SHELVES_TAG], revalidate: 6 * HOURS });

export type TodaysShelf = NonNullable<Awaited<ReturnType<typeof chooseForDay>>>;
export type ShelfBook = TodaysShelf["shelf"][number];

// The book page's shelf: books from the same category that can be read free,
// in the book's own language where there are enough of them. The page leaves
// its own book out.
export const loadCategoryShelf = unstable_cache(
  async (categoryId: string, language: string) => {
    const all = await prisma.book.findMany({
      where: { ...free(), curated: true, categoryId },
      select: { id: true, coverPublicId: true, language: true },
    });
    const same = all.filter((b) => b.language === language);
    const rows = same.length >= 5 ? same : all;
    const ids = rotation(rows.map((b) => b.id));
    const scans = new Set(rows.filter((b) => b.coverPublicId).map((b) => b.id));
    const ordered = [...ids.filter((id) => scans.has(id)).slice(0, 5), ...ids.filter((id) => !scans.has(id)).slice(0, 5)];
    // Scans and drawn covers alternate, as on the home page.
    const a = ordered.filter((id) => scans.has(id));
    const b = ordered.filter((id) => !scans.has(id));
    const mixed: string[] = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (b[i]) mixed.push(b[i]);
      if (a[i]) mixed.push(a[i]);
    }
    return shelfBooks(mixed);
  },
  ["category-shelf-v2"],
  { tags: [SHELVES_TAG], revalidate: 6 * HOURS }
);
