"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { bn } from "@/lib/bangla";
import { describeDbError } from "@/lib/db-errors";
import { bookIdFor, bookKeys, clashesWith, keySetOf } from "@/lib/book-catalog";
import { bookFormSchema, bookImportRowSchema, fieldErrorsOf, type BookFieldErrors } from "@/lib/book-schema";
import { bookSearchText } from "@/lib/search";

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
  "এই বইয়ের একটি পিডিএফ লাইব্রেরিতে আছে, তাই পাবলিক ডোমেইনের চিহ্ন তুলে দেওয়া যাবে না। আগে পিডিএফটি মুছে ফেলুন।";

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
      prisma.book.findUnique({ where: { id: bookId }, select: { id: true, _count: { select: { files: true } } } }),
      prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
      allBookIdentities(),
    ]);
    if (!book) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
    if (!category) return { success: false, fieldErrors: { categoryId: "বিভাগটি খুঁজে পাওয়া যায়নি।" } };
    if (!data.isPublicDomain && book._count.files > 0) {
      return { success: false, message: HAS_PDF, fieldErrors: { isPublicDomain: HAS_PDF } };
    }
    if (clashesWith(data, keySetOf(existing.filter((b) => b.id !== bookId)))) {
      return { success: false, message: DUPLICATE, fieldErrors: { title: DUPLICATE } };
    }

    // Un-marking is conditioned on "still no PDF" in the same statement, so a
    // PDF uploaded a moment ago can't end up on a book marked as copyrighted.
    const result = await prisma.book.updateMany({
      where: { id: bookId, ...(data.isPublicDomain ? {} : { files: { none: {} } }) },
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
      },
    });
    if (result.count === 1) {
      revalidateBookPages();
      return { success: true, message: "বইটি মুছে ফেলা হয়েছে।" };
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { _count: { select: { reviews: true, shelfItems: true, wishlistItems: true, starterPicks: true, files: true } } },
    });
    if (!book) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };

    const c = book._count;
    const attached = [
      c.reviews > 0 && `${bn(c.reviews)}টি পর্যালোচনা`,
      c.shelfItems > 0 && `${bn(c.shelfItems)}জন পাঠকের বইতাকে রাখা`,
      c.wishlistItems > 0 && `${bn(c.wishlistItems)}টি উইশলিস্টে রাখা`,
      c.starterPicks > 0 && "বিভাগের “শুরু করুন এখান থেকে” বই হিসেবে বাছাই",
      c.files > 0 && "লাইব্রেরির পিডিএফ",
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
  valid: { row: number; title: string; titleBangla: string | null; author: string; category: string; isPublicDomain: boolean }[];
  invalid: { row: number; title: string; reasons: string[] }[];
  duplicates: { row: number; title: string; author: string; reason: string }[];
  inserted?: number;
};

const emptyPreview = (message: string): ImportPreview => ({ ok: false, message, total: 0, valid: [], invalid: [], duplicates: [] });

// Validates a whole file without writing anything. Two queries in total
// (categories, existing books) however many rows -- never one per row.
async function analyzeImport(jsonText: string): Promise<{ preview: ImportPreview; rows: Prisma.BookCreateManyInput[] }> {
  if (typeof jsonText !== "string" || jsonText.length > MAX_IMPORT_CHARS) {
    return { preview: emptyPreview("ফাইলটি অনেক বড়; ১ মেগাবাইটের কম রাখুন।"), rows: [] };
  }
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    return { preview: emptyPreview("ফাইলটি সঠিক JSON নয়।"), rows: [] };
  }
  const list = Array.isArray(parsedJson)
    ? parsedJson
    : parsedJson && typeof parsedJson === "object" && Array.isArray((parsedJson as { books?: unknown }).books)
      ? (parsedJson as { books: unknown[] }).books
      : null;
  if (!list) return { preview: emptyPreview("ফাইলে বইয়ের একটি তালিকা (JSON array) থাকতে হবে।"), rows: [] };
  if (list.length === 0) return { preview: emptyPreview("ফাইলে কোনো বই নেই।"), rows: [] };
  if (list.length > MAX_IMPORT_ROWS) {
    return {
      preview: emptyPreview(`একটি ফাইলে সর্বোচ্চ ${bn(MAX_IMPORT_ROWS)}টি বই দেওয়া যায়; এই ফাইলে আছে ${bn(list.length)}টি।`),
      rows: [],
    };
  }

  const [categories, existing] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    allBookIdentities(),
  ]);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const existingKeys = keySetOf(existing);
  const takenIds = new Set(existing.map((b) => b.id));
  const seenInFile = new Map<string, number>(); // book key -> row number

  const preview: ImportPreview = { ok: true, total: list.length, valid: [], invalid: [], duplicates: [] };
  const rows: Prisma.BookCreateManyInput[] = [];

  list.forEach((raw, index) => {
    const row = index + 1;
    const rawTitle = raw && typeof raw === "object" && typeof (raw as { title?: unknown }).title === "string" ? (raw as { title: string }).title : "(নাম নেই)";
    const parsed = bookImportRowSchema.safeParse(raw);
    if (!parsed.success) {
      const reasons = parsed.error.issues.map((i) =>
        i.code === "unrecognized_keys" ? `${i.message}: ${i.keys.join(", ")}` : i.message
      );
      preview.invalid.push({ row, title: rawTitle, reasons: [...new Set(reasons)] });
      return;
    }
    const { category: slug, ...data } = parsed.data;
    const category = categoryBySlug.get(slug);
    if (!category) {
      preview.invalid.push({ row, title: data.title, reasons: [`বিভাগ “${slug}” খুঁজে পাওয়া যায়নি।`] });
      return;
    }
    if (clashesWith(data, existingKeys)) {
      preview.duplicates.push({ row, title: data.title, author: data.author, reason: "আগে থেকেই ক্যাটালগে আছে" });
      return;
    }
    const keys = bookKeys(data);
    const earlier = keys.map((k) => seenInFile.get(k)).find((r) => r !== undefined);
    if (earlier !== undefined) {
      preview.duplicates.push({ row, title: data.title, author: data.author, reason: `এই ফাইলেই আগে আছে (সারি ${bn(earlier)})` });
      return;
    }
    for (const k of keys) seenInFile.set(k, row);

    rows.push({ ...data, id: bookIdFor(category.slug, data.title, takenIds), categoryId: category.id, searchText: bookSearchText(data) });
    preview.valid.push({ row, title: data.title, titleBangla: data.titleBangla, author: data.author, category: slug, isPublicDomain: data.isPublicDomain });
  });

  return { preview, rows };
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
// trusted -- then writes every valid row in one createMany statement. No
// interactive transaction and no per-row queries, so Prisma's 5-second
// transaction limit can't be hit on a slow connection.
export async function importBooks(jsonText: string): Promise<ImportPreview> {
  if (!(await getAdminUserId())) return emptyPreview(NOT_ADMIN);
  try {
    const { preview, rows } = await analyzeImport(jsonText);
    if (!preview.ok) return preview;
    if (rows.length === 0) return { ...preview, ok: false, message: "যোগ করার মতো কোনো সঠিক নতুন বই নেই।", inserted: 0 };

    const { count } = await prisma.book.createMany({ data: rows, skipDuplicates: true });
    revalidateBookPages();
    const skipped = preview.duplicates.length + preview.invalid.length;
    return {
      ...preview,
      inserted: count,
      message: `${bn(count)}টি বই যোগ করা হয়েছে।${skipped > 0 ? ` ${bn(preview.duplicates.length)}টি ডুপ্লিকেট ও ${bn(preview.invalid.length)}টি ত্রুটিপূর্ণ সারি বাদ দেওয়া হয়েছে।` : ""}`,
    };
  } catch (err) {
    console.error(`[admin] database error importing books: ${describeDbError(err)}`);
    return emptyPreview(SERVER_PROBLEM);
  }
}
