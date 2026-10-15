"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { describeDbError } from "@/lib/db-errors";
import { MAX_STARTER_NOTE } from "@/lib/starter-pick";

// A category's "start here" book: the one book its page puts first, with a
// note on why it makes a good first read. One per category; choosing another
// replaces it.

export type StarterPickResult = { success: boolean; message?: string };

const NOT_ADMIN = "শুধু অ্যাডমিন বিভাগের শুরুর বই বাছাই করতে পারবেন।";
const SERVER_PROBLEM = "সার্ভারে সাময়িক সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";

const pickSchema = z.object({
  categoryId: z.string().trim().min(1, "বিভাগ পাওয়া যায়নি।").max(100),
  bookId: z.string({ required_error: "একটি বই বেছে নিন।" }).trim().min(1, "একটি বই বেছে নিন।").max(200),
  note: z
    .string({ required_error: "কেন এটি ভালো প্রথম বই, তা লিখুন।" })
    .trim()
    .min(1, "কেন এটি ভালো প্রথম বই, তা লিখুন।")
    .max(MAX_STARTER_NOTE, `নোটটি ${MAX_STARTER_NOTE} অক্ষরের মধ্যে রাখুন।`),
});

function revalidate(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath(`/categories/${slug}`);
}

export async function setStarterPick(categoryId: string, bookId: string, note: string): Promise<StarterPickResult> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };

  const parsed = pickSchema.safeParse({ categoryId, bookId, note });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  const data = parsed.data;

  try {
    const [category, book] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true, slug: true } }),
      prisma.book.findUnique({ where: { id: data.bookId }, select: { id: true, categoryId: true } }),
    ]);
    if (!category) return { success: false, message: "বিভাগটি খুঁজে পাওয়া যায়নি।" };
    if (!book) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
    // A category's first book has to be one of its own.
    if (book.categoryId !== category.id) return { success: false, message: "শুধু এই বিভাগের কোনো বই বাছাই করা যায়।" };

    // One statement batch: the old pick goes and the new one is written
    // together, so the page never shows two picks or none in between.
    await prisma.$transaction([
      prisma.starterPick.deleteMany({ where: { categoryId: category.id, bookId: { not: book.id } } }),
      prisma.starterPick.upsert({
        where: { categoryId_bookId: { categoryId: category.id, bookId: book.id } },
        create: { categoryId: category.id, bookId: book.id, note: data.note, rank: 1 },
        update: { note: data.note, rank: 1 },
      }),
    ]);
    revalidate(category.slug);
    return { success: true, message: "শুরুর বই সংরক্ষণ করা হয়েছে।" };
  } catch (err) {
    console.error(`[admin] database error setting a starter pick: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}

export async function removeStarterPick(categoryId: string): Promise<StarterPickResult> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };

  const id = z.string().trim().min(1).max(100).safeParse(categoryId);
  if (!id.success) return { success: false, message: "বিভাগটি খুঁজে পাওয়া যায়নি।" };

  try {
    const category = await prisma.category.findUnique({ where: { id: id.data }, select: { id: true, slug: true } });
    if (!category) return { success: false, message: "বিভাগটি খুঁজে পাওয়া যায়নি।" };
    await prisma.starterPick.deleteMany({ where: { categoryId: category.id } });
    revalidate(category.slug);
    return { success: true, message: "শুরুর বই সরিয়ে ফেলা হয়েছে।" };
  } catch (err) {
    console.error(`[admin] database error removing a starter pick: ${describeDbError(err)}`);
    return { success: false, message: SERVER_PROBLEM };
  }
}
