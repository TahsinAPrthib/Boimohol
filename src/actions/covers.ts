"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { canBePublicDomain, publicDomainCutoffYear } from "@/lib/public-domain";
import { revalidateShelves } from "@/lib/todays-book";
import { rightsBasisSchema } from "@/lib/rights";
import { serverCloudinary } from "@/lib/cloudinary-server";
import { checkUploaded, COVER_FOLDER, COVER_FORMATS, isAllowedCoverSourceUrl, parseCoverUrl, type UploadedCover } from "@/lib/covers";
import { copyCoverToCloudinary, destroyCover } from "@/lib/covers-server";

// Real covers on /admin/books: set or replace one from a URL on an allowed
// source or from an uploaded file, remove one, and fetch many after an import
// (a few per call, so each call stays well inside the host's time limit).
// Only for books that pass the public-domain rule, and always with a note
// saying why the image is free to use.

export type CoverResult = { success: boolean; message: string };

const NOT_ADMIN = "শুধু অ্যাডমিন প্রচ্ছদ বদলাতে পারবেন।";
const NOT_FREE = "এই বইটি পাবলিক ডোমেইনে নেই, তাই এর আসল প্রচ্ছদের ছবি রাখা যাবে না; তৈরি করা প্রচ্ছদটিই থাকবে।";

const eligibleWhere = () => ({ isPublicDomain: true, authorDeathYear: { lte: publicDomainCutoffYear() } });

function revalidateCover(bookId: string) {
  revalidateShelves();
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/admin/books");
  revalidatePath("/library");
}

// Stores a cover already in Cloudinary on the book, if the book (still)
// passes the rule -- checked in the same statement as the write -- and
// deletes the cover it replaces. On refusal the new image is deleted.
async function attach(bookId: string, cover: { publicId: string; sourceUrl: string; rightsBasis: string }): Promise<CoverResult> {
  const before = await prisma.book.findUnique({ where: { id: bookId }, select: { coverPublicId: true } });
  const result = await prisma.book.updateMany({
    where: { id: bookId, ...eligibleWhere() },
    data: { coverPublicId: cover.publicId, coverSourceUrl: cover.sourceUrl, coverRightsBasis: cover.rightsBasis },
  });
  if (result.count === 0) {
    await destroyCover(cover.publicId);
    return { success: false, message: before ? NOT_FREE : "বইটি খুঁজে পাওয়া যায়নি।" };
  }
  if (before?.coverPublicId && before.coverPublicId !== cover.publicId) await destroyCover(before.coverPublicId);
  return { success: true, message: before?.coverPublicId ? "প্রচ্ছদ বদলানো হয়েছে।" : "প্রচ্ছদ যোগ করা হয়েছে।" };
}

async function eligibleBook(bookId: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true, isPublicDomain: true, authorDeathYear: true } });
  if (!book) return { ok: false as const, message: "বইটি খুঁজে পাওয়া যায়নি।" };
  if (!book.isPublicDomain || !canBePublicDomain(book.authorDeathYear)) return { ok: false as const, message: NOT_FREE };
  return { ok: true as const };
}

const fromUrlSchema = z.object({
  bookId: z.string().trim().min(1),
  url: z.string().trim().min(1, "ছবির ঠিকানা দিন।").max(2000),
  rightsBasis: rightsBasisSchema,
});

export async function setCoverFromUrl(bookId: string, url: string, rightsBasis: string): Promise<CoverResult> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };
  const parsed = fromUrlSchema.safeParse({ bookId, url, rightsBasis });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  const source = parseCoverUrl(parsed.data.url);
  if (!source.ok) return { success: false, message: source.error };
  const eligible = await eligibleBook(parsed.data.bookId);
  if (!eligible.ok) return { success: false, message: eligible.message };

  const copied = await copyCoverToCloudinary(parsed.data.url, parsed.data.bookId);
  if (!copied.ok) return { success: false, message: copied.error };
  const result = await attach(parsed.data.bookId, { publicId: copied.publicId, sourceUrl: copied.sourceUrl, rightsBasis: parsed.data.rightsBasis });
  if (result.success) revalidateCover(parsed.data.bookId);
  return result;
}

export type CoverUploadSignature =
  | { success: true; signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string; allowedFormats: string }
  | { success: false; message: string };

// For an image the admin uploads (a cropped or cleaned-up scan, say): a
// signed upload into the covers folder, limited to image formats. Size and
// shape are checked afterwards against Cloudinary's record.
export async function getCoverUploadSignature(): Promise<CoverUploadSignature> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };
  const secret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!secret || !apiKey || !cloudName) return { success: false, message: "ছবি আপলোডের সেটআপ সম্পূর্ণ নয়।" };
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: COVER_FOLDER, allowed_formats: COVER_FORMATS.join(",") };
  const signature = serverCloudinary().utils.api_sign_request(params, secret);
  return { success: true, signature, timestamp, apiKey, cloudName, folder: params.folder, allowedFormats: params.allowed_formats };
}

const fromUploadSchema = z.object({
  bookId: z.string().trim().min(1),
  publicId: z.string().trim().min(1).max(300),
  sourceUrl: z
    .string()
    .trim()
    .min(1, "ছবিটি কোথা থেকে নেওয়া, সেই পাতার ঠিকানা দিন।")
    .max(2000)
    .refine(isAllowedCoverSourceUrl, "উৎস হতে হবে উইকিমিডিয়া, উইকিসংকলন বা প্রজেক্ট গুটেনবার্গের একটি পাতা।"),
  rightsBasis: rightsBasisSchema,
});

export async function setCoverFromUpload(bookId: string, publicId: string, sourceUrl: string, rightsBasis: string): Promise<CoverResult> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };
  const parsed = fromUploadSchema.safeParse({ bookId, publicId, sourceUrl, rightsBasis });
  if (!parsed.success) {
    if (publicId.startsWith(`${COVER_FOLDER}/`)) await destroyCover(publicId);
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }
  const eligible = await eligibleBook(parsed.data.bookId);
  if (!eligible.ok) {
    await destroyCover(parsed.data.publicId);
    return { success: false, message: eligible.message };
  }
  try {
    const asset = await serverCloudinary().api.resource(parsed.data.publicId, { resource_type: "image" });
    const problem = checkUploaded(asset as UploadedCover);
    if (problem) {
      await destroyCover(parsed.data.publicId);
      return { success: false, message: problem };
    }
  } catch {
    return { success: false, message: "আপলোড করা ছবিটি যাচাই করা যায়নি।" };
  }
  const result = await attach(parsed.data.bookId, { publicId: parsed.data.publicId, sourceUrl: parsed.data.sourceUrl, rightsBasis: parsed.data.rightsBasis });
  if (result.success) revalidateCover(parsed.data.bookId);
  return result;
}

export async function removeCover(bookId: string): Promise<CoverResult> {
  if (!(await getAdminUserId())) return { success: false, message: NOT_ADMIN };
  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { coverPublicId: true } });
  if (!book) return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
  if (!book.coverPublicId) return { success: true, message: "এই বইয়ের কোনো আসল প্রচ্ছদ নেই।" };
  await prisma.book.update({ where: { id: bookId }, data: { coverPublicId: null, coverSourceUrl: null, coverRightsBasis: null } });
  await destroyCover(book.coverPublicId);
  revalidateCover(bookId);
  return { success: true, message: "প্রচ্ছদ সরানো হয়েছে; তৈরি করা প্রচ্ছদটি দেখানো হবে।" };
}

// ---- after an import: the covers its rows named, a few at a time ----

export type CoverJob = { bookId: string; title: string; url: string; rightsBasis: string };
export type CoverJobResult = { bookId: string; ok: boolean; message: string };
const MAX_JOBS_PER_CALL = 3;

const jobSchema = z.object({
  bookId: z.string().trim().min(1).max(200),
  title: z.string().max(400),
  url: z.string().trim().min(1).max(2000),
  rightsBasis: rightsBasisSchema,
});

export async function importCovers(jobs: CoverJob[]): Promise<{ ok: boolean; message?: string; results: CoverJobResult[] }> {
  if (!(await getAdminUserId())) return { ok: false, message: NOT_ADMIN, results: [] };
  if (!Array.isArray(jobs) || jobs.length === 0 || jobs.length > MAX_JOBS_PER_CALL) return { ok: false, message: "অনুরোধটি সঠিক নয়।", results: [] };
  const results: CoverJobResult[] = [];
  // One at a time: the sources are asked politely, and one failure never
  // stops the others.
  for (const raw of jobs) {
    const parsed = jobSchema.safeParse(raw);
    const bookId = typeof raw?.bookId === "string" ? raw.bookId : "";
    if (!parsed.success) {
      results.push({ bookId, ok: false, message: parsed.error.issues[0]?.message ?? "সারিটি সঠিক নয়।" });
      continue;
    }
    const job = parsed.data;
    try {
      const eligible = await eligibleBook(job.bookId);
      if (!eligible.ok) {
        results.push({ bookId: job.bookId, ok: false, message: eligible.message });
        continue;
      }
      const copied = await copyCoverToCloudinary(job.url, job.bookId);
      if (!copied.ok) {
        results.push({ bookId: job.bookId, ok: false, message: copied.error });
        continue;
      }
      const attached = await attach(job.bookId, { publicId: copied.publicId, sourceUrl: copied.sourceUrl, rightsBasis: job.rightsBasis });
      results.push({ bookId: job.bookId, ok: attached.success, message: attached.message });
      if (attached.success) revalidatePath(`/books/${job.bookId}`);
    } catch (err) {
      console.error(`[covers] import of a cover for ${job.bookId} failed: ${err instanceof Error ? err.message : err}`);
      results.push({ bookId: job.bookId, ok: false, message: "সার্ভারে সমস্যা হয়েছে; আবার চেষ্টা করুন।" });
    }
  }
  if (results.some((r) => r.ok)) {
    revalidateShelves();
    revalidatePath("/library");
    revalidatePath("/admin/books");
  }
  return { ok: true, results };
}
