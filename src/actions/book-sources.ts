"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { canBePublicDomain } from "@/lib/public-domain";
import { rightsBasisSchema } from "@/lib/rights";
import { parseSourceUrl } from "@/lib/book-sources";
import { describeDbError } from "@/lib/db-errors";

// Free copies of a book hosted elsewhere (Wikisource, Project Gutenberg, the
// Internet Archive). They follow the PDF's rule exactly: only for a book
// marked public domain whose author's death year backs that up, checked here
// on the server whatever the form allowed.

export type BookSourceResult = { success: boolean; message?: string; sourceId?: string };

const NOT_ADMIN = "শুধু অ্যাডমিন বাইরের কপির লিংক যোগ, সম্পাদনা বা মুছে ফেলতে পারবেন।";
const NOT_PUBLIC_DOMAIN =
  "এই বইটি পাবলিক ডোমেইনে নেই, তাই এর বিনামূল্যের কপির লিংক দেওয়া যাবে না। " +
  "কপিরাইটের মেয়াদ শেষ হয়েছে এমন বই-ই কেবল বিনামূল্যে পড়তে দেওয়া যায়।";
const ALREADY_THERE = "এই লিংকটি এই বইয়ে আগেই যোগ করা আছে।";
const NOT_FOUND = "লিংকটি খুঁজে পাওয়া যায়নি।";
const SERVER_PROBLEM = "সার্ভারে সাময়িক সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
const MAX_SOURCES_PER_BOOK = 10;

const idSchema = z.string().trim().min(1).max(100);
const inputSchema = z.object({ url: z.string().max(5000), rightsBasis: rightsBasisSchema });

const isUniqueClash = (err: unknown) => (err as { code?: string } | null)?.code === "P2002";

async function bookIsEligible(bookId: string): Promise<boolean | null> {
  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { isPublicDomain: true, authorDeathYear: true } });
  if (!book) return null;
  return book.isPublicDomain && canBePublicDomain(book.authorDeathYear);
}

function revalidate(bookId: string) {
  revalidatePath("/admin/books");
  revalidatePath("/library");
  revalidatePath(`/books/${bookId}`);
}

function parseInput(url: unknown, rightsBasis: unknown) {
  const parsed = inputSchema.safeParse({ url, rightsBasis });
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  const source = parseSourceUrl(parsed.data.url);
  if (!source.ok) return { ok: false as const, message: source.message };
  return { ok: true as const, kind: source.kind, url: source.url, rightsBasis: parsed.data.rightsBasis };
}

export async function addBookSource(bookId: string, url: string, rightsBasis: string): Promise<BookSourceResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return { success: false, message: NOT_ADMIN };

  const id = idSchema.safeParse(bookId);
  if (!id.success) return { success: false, message: "বই নির্বাচন করা হয়নি।" };
  const input = parseInput(url, rightsBasis);
  if (!input.ok) return { success: false, message: input.message };

  try {
    const eligible = await bookIsEligible(id.data);
    if (eligible === null) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
    if (!eligible) return { success: false, message: NOT_PUBLIC_DOMAIN };
    const count = await prisma.bookSource.count({ where: { bookId: id.data } });
    if (count >= MAX_SOURCES_PER_BOOK) return { success: false, message: "একটি বইয়ে সর্বোচ্চ ১০টি বাইরের কপি দেওয়া যায়।" };

    const source = await prisma.bookSource.create({
      data: { bookId: id.data, kind: input.kind, url: input.url, rightsBasis: input.rightsBasis, addedById: adminId },
      select: { id: true },
    });

    // Un-marking a book is refused while it has a source (updateBook checks
    // that in the same statement), but it could have happened between the
    // check above and this insert. Look once more and undo if so.
    if (!(await bookIsEligible(id.data))) {
      await prisma.bookSource.deleteMany({ where: { id: source.id } });
      return { success: false, message: NOT_PUBLIC_DOMAIN };
    }

    revalidate(id.data);
    return { success: true, sourceId: source.id, message: "লিংকটি যোগ করা হয়েছে।" };
  } catch (err) {
    if (isUniqueClash(err)) return { success: false, message: ALREADY_THERE };
    console.error(`[admin] database error adding a book source: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}

export async function updateBookSource(sourceId: string, url: string, rightsBasis: string): Promise<BookSourceResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return { success: false, message: NOT_ADMIN };

  const id = idSchema.safeParse(sourceId);
  if (!id.success) return { success: false, message: NOT_FOUND };
  const input = parseInput(url, rightsBasis);
  if (!input.ok) return { success: false, message: input.message };

  try {
    const existing = await prisma.bookSource.findUnique({ where: { id: id.data }, select: { bookId: true } });
    if (!existing) return { success: false, message: NOT_FOUND };
    if (!(await bookIsEligible(existing.bookId))) return { success: false, message: NOT_PUBLIC_DOMAIN };

    // updateMany: a source removed in another tab meanwhile is a plain "not
    // found" rather than a thrown error.
    const { count } = await prisma.bookSource.updateMany({
      where: { id: id.data },
      data: { kind: input.kind, url: input.url, rightsBasis: input.rightsBasis },
    });
    if (count === 0) return { success: false, message: NOT_FOUND };

    revalidate(existing.bookId);
    return { success: true, sourceId: id.data, message: "লিংকটি হালনাগাদ করা হয়েছে।" };
  } catch (err) {
    if (isUniqueClash(err)) return { success: false, message: ALREADY_THERE };
    console.error(`[admin] database error updating a book source: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}

// Removing a link is always allowed -- it only ever makes less available.
export async function deleteBookSource(sourceId: string): Promise<BookSourceResult> {
  const adminId = await getAdminUserId();
  if (!adminId) return { success: false, message: NOT_ADMIN };

  const id = idSchema.safeParse(sourceId);
  if (!id.success) return { success: false, message: NOT_FOUND };

  try {
    const existing = await prisma.bookSource.findUnique({ where: { id: id.data }, select: { bookId: true } });
    if (!existing) return { success: false, message: NOT_FOUND };
    await prisma.bookSource.deleteMany({ where: { id: id.data } });
    revalidate(existing.bookId);
    return { success: true, message: "লিংকটি সরিয়ে ফেলা হয়েছে।" };
  } catch (err) {
    console.error(`[admin] database error removing a book source: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}
