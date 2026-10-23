"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { bn } from "@/lib/bangla";
import { describeDbError } from "@/lib/db-errors";
import { bookIdFor, bookKeys, clashesWith, findExisting, indexByKeys, keySetOf } from "@/lib/book-catalog";
import { bookFormSchema, bookImportRowSchema, bookUpdateRowSchema, fieldErrorsOf, type BookFieldErrors } from "@/lib/book-schema";
import { parseCoverUrl } from "@/lib/covers";
import type { CoverJob } from "@/actions/covers";
import { bookSearchText } from "@/lib/search";
import { parseSourceUrl, SOURCE_LABEL, type SourceKind } from "@/lib/book-sources";
import { canBePublicDomain, publicDomainCutoffYear } from "@/lib/public-domain";

// Every action re-checks ADMIN against the database (getAdminUserId), never
// the session's copy of the role -- the pages being hidden is not enough.

export type BookFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: BookFieldErrors;
  bookId?: string;
};

const NOT_ADMIN = "শুধু অ্যাডমিন বই যোগ, সম্পাদনা বা মুছে ফেলতে পারবেন।";
const DUPLICATE = "এই লেখকের এই নামে একটি বই আগে থেকেই আছে।";
const SERVER_PROBLEM = "সার্ভারে সাময়িক সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
const HAS_PDF =
  "এই বইয়ের একটি বিনামূল্যের কপি (পিডিএফ বা বাইরের সাইটের লিংক) বা আসল প্রচ্ছদের ছবি আছে, তাই পাবলিক ডোমেইনের চিহ্ন তুলে দেওয়া যাবে না। আগে সেগুলো সরিয়ে ফেলুন।";

function formInput(formData: FormData) {
  const field = (name: string) => formData.get(name);
  return {
    title: field("title"),
    titleBangla: field("titleBangla"),
    author: field("author"),
    categoryId: field("categoryId"),
    description: field("description"),
    language: field("language"),
    publishYear: field("publishYear"),
    authorDeathYear: field("authorDeathYear"),
    isPublicDomain: field("isPublicDomain"),
    translator: field("translator"),
    searchAliases: field("searchAliases") ?? "",
  };
}

// The catalogue is small enough to load every book's identity in one query;
// duplicate checks then run in memory with Unicode-aware matching.
function allBookIdentities() {
  return prisma.book.findMany({ select: { id: true, title: true, titleBangla: true, author: true } });
}

function revalidateBookPages(bookId?: string) {
  revalidatePath("/admin/books");
  revalidatePath("/library");
  if (bookId) revalidatePath(`/books/${bookId}`);
}

export async function createBook(_prev: BookFormState, formData: FormData): Promise<BookFormState> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };

  const parsed = bookFormSchema.safeParse(formInput(formData));
  if (!parsed.success) {
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const { categoryId, ...data } = parsed.data;

  try {
    const [category, existing] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, slug: true } }),
      allBookIdentities(),
    ]);
    if (!category) return { success: false, fieldErrors: { categoryId: "বিভাগটি খুঁজে পাওয়া যায়নি।" } };
    if (clashesWith(data, keySetOf(existing))) {
      return { success: false, message: DUPLICATE, fieldErrors: { title: DUPLICATE } };
    }

    const id = bookIdFor(category.slug, data.title, new Set(existing.map((b) => b.id)));
    await prisma.book.create({ data: { ...data, id, categoryId: category.id, searchText: bookSearchText(data) } });
    revalidateBookPages(id);
    return { success: true, message: "বইটি যোগ করা হয়েছে।", bookId: id };
  } catch (err) {
    console.error(`[admin] database error creating a book: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}

export async function updateBook(bookId: string, _prev: BookFormState, formData: FormData): Promise<BookFormState> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };

  const parsed = bookFormSchema.safeParse(formInput(formData));
  if (!parsed.success) {
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const { categoryId, ...data } = parsed.data;

  try {
    const [book, category, existing] = await Promise.all([
      prisma.book.findUnique({ where: { id: bookId }, select: { id: true, coverPublicId: true, _count: { select: { files: true, sources: true } } } }),
      prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
      allBookIdentities(),
    ]);
    if (!book) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
    if (!category) return { success: false, fieldErrors: { categoryId: "বিভাগটি খুঁজে পাওয়া যায়নি।" } };
    if (!data.isPublicDomain && (book._count.files + book._count.sources > 0 || book.coverPublicId)) {
      return { success: false, message: HAS_PDF, fieldErrors: { isPublicDomain: HAS_PDF } };
    }
    if (clashesWith(data, keySetOf(existing.filter((b) => b.id !== bookId)))) {
      return { success: false, message: DUPLICATE, fieldErrors: { title: DUPLICATE } };
    }

    // Un-marking is conditioned on "still no free copy" in the same
    // statement, so a PDF or link added a moment ago can't end up on a book
    // marked as copyrighted. (A death year too recent for public domain is
    // refused by the schema while the flag is on, so this is the only path.)
    const result = await prisma.book.updateMany({
      where: { id: bookId, ...(data.isPublicDomain ? {} : { files: { none: {} }, sources: { none: {} }, coverPublicId: null }) },
      data: { ...data, categoryId: category.id, searchText: bookSearchText(data) },
    });
    if (result.count === 0) return { success: false, message: HAS_PDF, fieldErrors: { isPublicDomain: HAS_PDF } };

    revalidateBookPages(bookId);
    return { success: true, message: "পরিবর্তন সংরক্ষণ করা হয়েছে।", bookId };
  } catch (err) {
    console.error(`[admin] database error updating a book: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}

export type DeleteBookResult = { success: boolean; message: string };

export async function deleteBook(bookId: string): Promise<DeleteBookResult> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };

  try {
    // One statement: it deletes only if nothing is attached at that moment,
    // so nothing can be attached between a check and the delete.
    const result = await prisma.book.deleteMany({
      where: {
        id: bookId,
        reviews: { none: {} },
        shelfItems: { none: {} },
        wishlistItems: { none: {} },
        starterPicks: { none: {} },
        files: { none: {} },
        coverPublicId: null,
      },
    });
    if (result.count === 1) {
      revalidateBookPages();
      return { success: true, message: "বইটি মুছে ফেলা হয়েছে।" };
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { coverPublicId: true, _count: { select: { reviews: true, shelfItems: true, wishlistItems: true, starterPicks: true, files: true } } },
    });
    if (!book) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };

    const c = book._count;
    const attached = [
      c.reviews > 0 && `${bn(c.reviews)}টি পর্যালোচনা`,
      c.shelfItems > 0 && `${bn(c.shelfItems)}জন পাঠকের বইতাকে রাখা`,
      c.wishlistItems > 0 && `${bn(c.wishlistItems)}টি উইশলিস্টে রাখা`,
      c.starterPicks > 0 && "বিভাগের “শুরু করুন এখান থেকে” বই হিসেবে বাছাই",
      c.files > 0 && "লাইব্রেরির পিডিএফ",
      book.coverPublicId && "আসল প্রচ্ছদের ছবি (আগে সেটি সরান, তাতে Cloudinary থেকেও মুছে যায়)",
    ].filter(Boolean);
    return {
      success: false,
      message: `বইটি মুছে ফেলা যাবে না, কারণ এর সঙ্গে যুক্ত আছে: ${attached.join(", ")}। কিছুই যুক্ত না থাকলে তবেই বই মুছে ফেলা যায়।`,
    };
  } catch (err) {
    console.error(`[admin] database error deleting a book: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}

// ---------------------------------------------------------------- import

const MAX_IMPORT_ROWS = 500;
const MAX_IMPORT_CHARS = 1_000_000;

export type ImportPreview = {
  ok: boolean;
  message?: string;
  total: number;
  valid: {
    row: number;
    title: string;
    titleBangla: string | null;
    author: string;
    category: string;
    isPublicDomain: boolean;
    sources: SourceKind[];
  }[];
  invalid: { row: number; title: string; reasons: string[] }[];
  duplicates: { row: number; title: string; author: string; reason: string }[];
  // Rows matching a book already in the catalog whose links are new: the
  // links are added to that book; nothing else about it changes.
  linked: { row: number; title: string; author: string; bookId: string; sources: SourceKind[] }[];
  // Update rows ("match" with "set" and/or "sources"): what each changes in a
  // book already in the catalog, in words.
  updated: { row: number; title: string; author: string; bookId: string; changes: string[] }[];
  // Real covers the rows name: fetched into Cloudinary after the rows are
  // saved, a few at a time, by the import page (coverJobs).
  covers: { row: number; title: string; author: string; change: "new" | "replace" }[];
  coverJobs?: CoverJob[];
  inserted?: number;
  insertedSources?: number;
  updatedBooks?: number;
};

const emptyPreview = (message: string): ImportPreview => ({
  ok: false,
  message,
  total: 0,
  valid: [],
  invalid: [],
  duplicates: [],
  linked: [],
  updated: [],
  covers: [],
});

type Analysis = {
  preview: ImportPreview;
  rows: Prisma.BookCreateManyInput[];
  sources: Omit<Prisma.BookSourceCreateManyInput, "addedById">[];
  bookUpdates: { id: string; data: Prisma.BookUpdateInput }[];
  sourceUpdates: { bookId: string; url: string; rightsBasis: string }[];
  coverJobs: CoverJob[];
  // Same image, new note: changed in place, nothing to fetch.
  coverNotes: { bookId: string; sourceUrl: string; rightsBasis: string }[];
};

const emptyAnalysis = (message: string): Analysis => ({
  preview: emptyPreview(message),
  rows: [],
  sources: [],
  bookUpdates: [],
  sourceUpdates: [],
  coverJobs: [],
  coverNotes: [],
});
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const reasonsOf = (error: z.ZodError) => [
  ...new Set(error.issues.map((i) => (i.code === "unrecognized_keys" ? `${i.message}: ${i.keys.join(", ")}` : i.message))),
];

// Validates a whole file without writing anything. Three queries in total
// (categories, existing books, existing links) however many rows -- never one
// per row.
async function analyzeImport(jsonText: string): Promise<Analysis> {
  if (typeof jsonText !== "string" || jsonText.length > MAX_IMPORT_CHARS) return emptyAnalysis("ফাইলটি অনেক বড়; ১ মেগাবাইটের কম রাখুন।");
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    return emptyAnalysis("ফাইলটি সঠিক JSON নয়।");
  }
  const list = Array.isArray(parsedJson)
    ? parsedJson
    : parsedJson && typeof parsedJson === "object" && Array.isArray((parsedJson as { books?: unknown }).books)
      ? (parsedJson as { books: unknown[] }).books
      : null;
  if (!list) return emptyAnalysis("ফাইলে বইয়ের একটি তালিকা (JSON array) থাকতে হবে।");
  if (list.length === 0) return emptyAnalysis("ফাইলে কোনো বই নেই।");
  if (list.length > MAX_IMPORT_ROWS) {
    return emptyAnalysis(`একটি ফাইলে সর্বোচ্চ ${bn(MAX_IMPORT_ROWS)}টি বই দেওয়া যায়; এই ফাইলে আছে ${bn(list.length)}টি।`);
  }

  const [categories, existing, existingLinks] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.book.findMany({
      select: {
        id: true,
        title: true,
        titleBangla: true,
        author: true,
        translator: true,
        searchAliases: true,
        isPublicDomain: true,
        authorDeathYear: true,
        coverPublicId: true,
        coverSourceUrl: true,
        coverRightsBasis: true,
      },
    }),
    prisma.bookSource.findMany({ select: { bookId: true, url: true, kind: true, rightsBasis: true } }),
  ]);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const existingByKey = indexByKeys(existing);
  const takenIds = new Set(existing.map((b) => b.id));
  const seenInFile = new Map<string, number>(); // book key -> row number
  const linkKey = (bookId: string, url: string) => `${bookId} ${url}`;
  const links = new Map(existingLinks.map((s) => [linkKey(s.bookId, s.url), { kind: s.kind as SourceKind, rightsBasis: s.rightsBasis }]));

  const preview: ImportPreview = { ok: true, total: list.length, valid: [], invalid: [], duplicates: [], linked: [], updated: [], covers: [] };
  const rows: Prisma.BookCreateManyInput[] = [];
  const sources: Analysis["sources"] = [];
  const bookUpdates: Analysis["bookUpdates"] = [];
  const sourceUpdates: Analysis["sourceUpdates"] = [];
  const coverJobs: CoverJob[] = [];
  const coverNotes: Analysis["coverNotes"] = [];

  // A row's cover for a book (new or already in the catalog): what it
  // changes, in words, or null when the book already has that image and note.
  // The schema has already checked the URL's source.
  type CoverTarget = { id: string; title: string; titleBangla: string | null; author: string; coverPublicId?: string | null; coverSourceUrl?: string | null; coverRightsBasis?: string | null };
  const planCover = (row: number, book: CoverTarget, cover: { url: string; rightsBasis: string }): string | null => {
    const parsed = parseCoverUrl(cover.url);
    if (!parsed.ok) return null;
    const shown = { row, title: book.titleBangla || book.title, author: book.author };
    if (book.coverPublicId && book.coverSourceUrl === parsed.sourceUrl) {
      if (book.coverRightsBasis === cover.rightsBasis) return null;
      coverNotes.push({ bookId: book.id, sourceUrl: parsed.sourceUrl, rightsBasis: cover.rightsBasis });
      book.coverRightsBasis = cover.rightsBasis;
      return "প্রচ্ছদের “কেন ব্যবহার করা যায়” নোট হালনাগাদ";
    }
    const change = book.coverPublicId ? "replace" : "new";
    coverJobs.push({ bookId: book.id, title: book.titleBangla || book.title, url: cover.url, rightsBasis: cover.rightsBasis });
    preview.covers.push({ ...shown, change });
    return change === "replace" ? "প্রচ্ছদ বদল" : "আসল প্রচ্ছদ যোগ";
  };

  // A correction to a book that already exists (see bookUpdateRowSchema).
  const analyzeUpdate = (row: number, raw: unknown) => {
    const rawMatch = (raw as { match?: { title?: unknown } }).match;
    const rawTitle = typeof rawMatch?.title === "string" ? rawMatch.title : "(নাম নেই)";
    const parsed = bookUpdateRowSchema.safeParse(raw);
    if (!parsed.success) {
      preview.invalid.push({ row, title: rawTitle, reasons: reasonsOf(parsed.error) });
      return;
    }
    const { match: who, set, sources: rowSources = [], cover } = parsed.data;
    const book = findExisting(who, existingByKey);
    if (!book) {
      preview.invalid.push({ row, title: who.title, reasons: ["ক্যাটালগে এই বইটি পাওয়া যায়নি; হালনাগাদের সারি শুধু আগে থেকে থাকা বই বদলায়।"] });
      return;
    }
    const changes: string[] = [];
    const data: { translator?: string | null; titleBangla?: string | null; searchAliases?: string[] } = {};
    if (set?.translator !== undefined && set.translator !== book.translator) {
      data.translator = set.translator;
      changes.push(`অনুবাদক: ${book.translator ?? "—"} → ${set.translator ?? "—"}`);
    }
    if (set?.titleBangla !== undefined && set.titleBangla !== book.titleBangla) {
      data.titleBangla = set.titleBangla;
      changes.push(`বাংলা নাম: ${book.titleBangla ?? "—"} → ${set.titleBangla ?? "— (দেখানো হবে না)"}`);
    }
    if (set?.searchAliases !== undefined && !sameList(set.searchAliases, book.searchAliases)) {
      data.searchAliases = set.searchAliases;
      changes.push(`খোঁজার বিকল্প নাম: ${set.searchAliases.join(", ") || "—"}`);
    }
    const eligible = book.isPublicDomain && canBePublicDomain(book.authorDeathYear);
    for (const s of rowSources) {
      const link = parseSourceUrl(s.url);
      if (!link.ok) continue;
      const current = links.get(linkKey(book.id, link.url));
      if (current) {
        if (current.rightsBasis !== s.rightsBasis) {
          sourceUpdates.push({ bookId: book.id, url: link.url, rightsBasis: s.rightsBasis });
          current.rightsBasis = s.rightsBasis;
          changes.push(`${SOURCE_LABEL[current.kind]}-এর লিংকের “কেন বিনামূল্যে” নোট হালনাগাদ`);
        }
      } else if (!eligible) {
        preview.invalid.push({ row, title: book.titleBangla || book.title, reasons: ["বইটি পাবলিক ডোমেইন হিসেবে চিহ্নিত নয়, তাই লিংক যোগ করা যাবে না।"] });
        return;
      } else {
        sources.push({ bookId: book.id, kind: link.kind, url: link.url, rightsBasis: s.rightsBasis });
        links.set(linkKey(book.id, link.url), { kind: link.kind, rightsBasis: s.rightsBasis });
        changes.push(`লিংক যোগ: ${SOURCE_LABEL[link.kind]}`);
      }
    }
    if (cover) {
      if (!eligible) {
        preview.invalid.push({ row, title: book.titleBangla || book.title, reasons: ["বইটি পাবলিক ডোমেইন হিসেবে চিহ্নিত নয়, তাই আসল প্রচ্ছদের ছবি দেওয়া যাবে না।"] });
        return;
      }
      const coverChange = planCover(row, book, cover);
      if (coverChange) changes.push(coverChange);
    }
    const shown = { row, title: book.titleBangla || book.title, author: book.author };
    if (changes.length === 0) {
      preview.duplicates.push({ ...shown, reason: "কোনো পরিবর্তন নেই — বইটি আগেই হালনাগাদ করা" });
      return;
    }
    if (Object.keys(data).length > 0) {
      // Later rows in the same file see the change too.
      Object.assign(book, data);
      bookUpdates.push({ id: book.id, data: { ...data, searchText: bookSearchText(book) } });
    }
    preview.updated.push({ ...shown, bookId: book.id, changes });
  };

  list.forEach((raw, index) => {
    const row = index + 1;
    if (raw && typeof raw === "object" && "match" in raw) {
      analyzeUpdate(row, raw);
      return;
    }
    const rawTitle = raw && typeof raw === "object" && typeof (raw as { title?: unknown }).title === "string" ? (raw as { title: string }).title : "(নাম নেই)";
    const parsed = bookImportRowSchema.safeParse(raw);
    if (!parsed.success) {
      preview.invalid.push({ row, title: rawTitle, reasons: reasonsOf(parsed.error) });
      return;
    }
    const { category: slug, sources: rowSources = [], cover, ...data } = parsed.data;
    const category = categoryBySlug.get(slug);
    if (!category) {
      preview.invalid.push({ row, title: data.title, reasons: [`বিভাগ “${slug}” খুঁজে পাওয়া যায়নি।`] });
      return;
    }
    // Already in the catalog (same author, and either title): never a second
    // copy of the book -- but its links can be added to the one that exists,
    // as long as that book passes the public-domain rule itself. Nothing else
    // about it changes (an update row does that, explicitly).
    const match = findExisting(data, existingByKey);
    if (match) {
      const shown = { row, title: match.titleBangla || match.title, author: match.author };
      const matchEligible = match.isPublicDomain && canBePublicDomain(match.authorDeathYear);
      // A cover for the book that exists, like its links.
      const coverChange = cover && matchEligible ? planCover(row, match, cover) : null;
      if (coverChange && rowSources.length === 0) {
        preview.updated.push({ ...shown, bookId: match.id, changes: [coverChange] });
        return;
      }
      if (rowSources.length === 0) {
        preview.duplicates.push({ ...shown, reason: "আগে থেকেই ক্যাটালগে আছে" });
        return;
      }
      if (!matchEligible) {
        preview.duplicates.push({
          ...shown,
          reason: "আগে থেকেই ক্যাটালগে আছে; সেখানে বইটি পাবলিক ডোমেইন হিসেবে চিহ্নিত নয়, তাই লিংক যোগ করা হবে না",
        });
        return;
      }
      const fresh = rowSources
        .map((s) => ({ link: parseSourceUrl(s.url), rightsBasis: s.rightsBasis }))
        .filter((s): s is { link: { ok: true; kind: SourceKind; url: string }; rightsBasis: string } => s.link.ok)
        .filter((s) => !links.has(linkKey(match.id, s.link.url)));
      if (fresh.length === 0) {
        if (coverChange) preview.updated.push({ ...shown, bookId: match.id, changes: [coverChange] });
        else preview.duplicates.push({ ...shown, reason: "আগে থেকেই ক্যাটালগে আছে, লিংকসহ" });
        return;
      }
      for (const s of fresh) {
        links.set(linkKey(match.id, s.link.url), { kind: s.link.kind, rightsBasis: s.rightsBasis });
        sources.push({ bookId: match.id, kind: s.link.kind, url: s.link.url, rightsBasis: s.rightsBasis });
      }
      preview.linked.push({ ...shown, bookId: match.id, sources: fresh.map((s) => s.link.kind) });
      return;
    }
    const keys = bookKeys(data);
    const earlier = keys.map((k) => seenInFile.get(k)).find((r) => r !== undefined);
    if (earlier !== undefined) {
      preview.duplicates.push({ row, title: data.title, author: data.author, reason: `এই ফাইলেই আগে আছে (সারি ${bn(earlier)})` });
      return;
    }
    for (const k of keys) seenInFile.set(k, row);

    const id = bookIdFor(category.slug, data.title, takenIds);
    rows.push({ ...data, id, categoryId: category.id, searchText: bookSearchText(data) });
    if (cover) planCover(row, { id, title: data.title, titleBangla: data.titleBangla, author: data.author }, cover);
    // The schema has already accepted every link, so this only normalises it.
    const kinds: SourceKind[] = [];
    for (const s of rowSources) {
      const link = parseSourceUrl(s.url);
      if (!link.ok) continue;
      sources.push({ bookId: id, kind: link.kind, url: link.url, rightsBasis: s.rightsBasis });
      kinds.push(link.kind);
    }
    preview.valid.push({
      row,
      title: data.title,
      titleBangla: data.titleBangla,
      author: data.author,
      category: slug,
      isPublicDomain: data.isPublicDomain,
      sources: kinds,
    });
  });

  return { preview, rows, sources, bookUpdates, sourceUpdates, coverJobs, coverNotes };
}

export async function previewImport(jsonText: string): Promise<ImportPreview> {
  if (!(await getAdminUserId())) return emptyPreview(NOT_ADMIN);
  try {
    return (await analyzeImport(jsonText)).preview;
  } catch (err) {
    console.error(`[admin] database error previewing an import: ${describeDbError(err)}`);
    return emptyPreview(SERVER_PROBLEM);
  }
}

// Re-validates the file from scratch -- the preview the browser saw is never
// trusted -- then writes everything in one batch transaction: new books in
// one createMany, all new links in a second, then each update to a book or a
// link's note. No interactive transaction and no per-row queries before it,
// so Prisma's 5-second transaction limit can't be hit on a slow connection.
export async function importBooks(jsonText: string): Promise<ImportPreview> {
  const adminId = await getAdminUserId();
  if (!adminId) return emptyPreview(NOT_ADMIN);
  try {
    const { preview, rows, sources, bookUpdates, sourceUpdates, coverJobs, coverNotes } = await analyzeImport(jsonText);
    if (!preview.ok) return preview;
    if (rows.length === 0 && preview.linked.length === 0 && preview.updated.length === 0 && coverJobs.length === 0) {
      return { ...preview, ok: false, message: "যোগ বা হালনাগাদ করার মতো কিছু নেই।", inserted: 0 };
    }

    const [books, links] = (await prisma.$transaction([
      prisma.book.createMany({ data: rows, skipDuplicates: true }),
      prisma.bookSource.createMany({ data: sources.map((s) => ({ ...s, addedById: adminId })), skipDuplicates: true }),
      ...bookUpdates.map((u) => prisma.book.update({ where: { id: u.id }, data: u.data })),
      ...sourceUpdates.map((u) => prisma.bookSource.updateMany({ where: { bookId: u.bookId, url: u.url }, data: { rightsBasis: u.rightsBasis } })),
      ...coverNotes.map((u) => prisma.book.updateMany({ where: { id: u.bookId, coverSourceUrl: u.sourceUrl }, data: { coverRightsBasis: u.rightsBasis } })),
    ])) as [Prisma.BatchPayload, Prisma.BatchPayload, ...unknown[]];

    // As in addBookSource: an existing book could have been un-marked
    // between the check above and the insert. Take back any new link that now
    // sits on a book the rule doesn't clear.
    const newIds = new Set(rows.map((r) => r.id));
    const onExisting = sources.filter((s) => !newIds.has(s.bookId));
    if (onExisting.length > 0) {
      await prisma.bookSource.deleteMany({
        where: {
          bookId: { in: [...new Set(onExisting.map((s) => s.bookId))] },
          url: { in: onExisting.map((s) => s.url) },
          book: { OR: [{ isPublicDomain: false }, { authorDeathYear: null }, { authorDeathYear: { gt: publicDomainCutoffYear() } }] },
        },
      });
    }

    revalidateBookPages();
    for (const id of new Set([...onExisting.map((s) => s.bookId), ...preview.updated.map((u) => u.bookId)])) revalidatePath(`/books/${id}`);
    const skipped = preview.duplicates.length + preview.invalid.length;
    return {
      ...preview,
      inserted: books.count,
      insertedSources: links.count,
      updatedBooks: preview.updated.length,
      // Fetched next by the import page, a few per call (importCovers).
      coverJobs,
      message:
        `${bn(books.count)}টি বই যোগ করা হয়েছে` +
        (links.count > 0 ? `, সঙ্গে বাইরের সাইটে বিনামূল্যে পড়ার ${bn(links.count)}টি লিংক` : "") +
        (preview.linked.length > 0 ? ` (এর মধ্যে ${bn(preview.linked.length)}টি ক্যাটালগের আগের বইয়ে)` : "") +
        "।" +
        (preview.updated.length > 0 ? ` ${bn(preview.updated.length)}টি আগের বই হালনাগাদ করা হয়েছে।` : "") +
        (skipped > 0 ? ` ${bn(preview.duplicates.length)}টি ডুপ্লিকেট ও ${bn(preview.invalid.length)}টি ত্রুটিপূর্ণ সারি বাদ দেওয়া হয়েছে।` : "") +
        (coverJobs.length > 0 ? ` এবার ${bn(coverJobs.length)}টি প্রচ্ছদের ছবি আনা হবে।` : ""),
    };
  } catch (err) {
    console.error(`[admin] database error importing books: ${describeDbError(err)}`);
    return emptyPreview(SERVER_PROBLEM);
  }
}
