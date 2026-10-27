"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canBePublicDomain } from "@/lib/public-domain";
import { getAdminUserId } from "@/lib/authz";
import { rightsBasisSchema } from "@/lib/rights";
import { revalidateBookCounts } from "@/lib/book-listing";
import { serverCloudinary } from "@/lib/cloudinary-server";
import { MAX_PDF_BYTES, PDF_FOLDER, PDF_FORMAT } from "@/lib/cloudinary-url";

export type PdfUploadSignature = {
  success: boolean;
  message?: string;
  signature?: string;
  timestamp?: number;
  apiKey?: string;
  cloudName?: string;
  folder?: string;
  allowedFormats?: string;
};

export type LibraryActionResult = {
  success: boolean;
  message?: string;
  fileId?: string;
};

// Cloudinary verifies allowed_formats for raw uploads too -- a .txt is rejected
// with "Raw file format txt not allowed", confirmed against the account. Size is
// NOT signable (the same max_file_size limitation as listing photos), so it is
// enforced in createBookFile against the authoritative byte count.
function signedParams(timestamp: number) {
  return {
    timestamp,
    folder: PDF_FOLDER,
    allowed_formats: PDF_FORMAT,
  };
}

export async function getPdfUploadSignature(): Promise<PdfUploadSignature> {
  // getAdminUserId re-reads the role from the database; the session role is
  // never trusted for an authorization decision.
  const adminId = await getAdminUserId();
  if (!adminId) {
    return { success: false, message: "শুধু অ্যাডমিন ফাইল যোগ করতে পারবেন।" };
  }

  const secret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!secret || !apiKey || !cloudName) {
    return { success: false, message: "ফাইল আপলোডের সেটআপ সম্পূর্ণ নয়।" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = signedParams(timestamp);
  const signature = serverCloudinary().utils.api_sign_request(params, secret);

  return {
    success: true,
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder: params.folder,
    allowedFormats: params.allowed_formats,
  };
}

const createSchema = z.object({
  bookId: z.string().trim().min(1, "বই নির্বাচন করা হয়নি।"),
  publicId: z.string().trim().min(1, "ফাইলটি আপলোড হয়নি।").max(300),
  rightsBasis: rightsBasisSchema,
  sourceUrl: z.string().trim().max(500).optional(),
});

export async function createBookFile(
  bookId: string,
  publicId: string,
  rightsBasis: string,
  sourceUrl?: string
): Promise<LibraryActionResult> {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return { success: false, message: "শুধু অ্যাডমিন ফাইল যোগ করতে পারবেন।" };
  }

  const parsed = createSchema.safeParse({ bookId, publicId, rightsBasis, sourceUrl });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }

  const cld = serverCloudinary();
  const destroy = () =>
    cld.uploader.destroy(parsed.data.publicId, { resource_type: "raw" }).catch(() => undefined);

  const book = await prisma.book.findUnique({
    where: { id: parsed.data.bookId },
    select: { id: true, title: true, titleBangla: true, isPublicDomain: true, authorDeathYear: true },
  });
  if (!book) {
    await destroy();
    return { success: false, message: "বইটি খুঁজে পাওয়া যায়নি।" };
  }

  // The central rule of this feature: only genuinely public-domain works --
  // the flag alone isn't enough, the author's death year has to back it up.
  if (!book.isPublicDomain || !canBePublicDomain(book.authorDeathYear)) {
    await destroy();
    return {
      success: false,
      message:
        "এই বইটি পাবলিক ডোমেইনে নেই, তাই এর ফাইল লাইব্রেরিতে রাখা যাবে না। " +
        "কপিরাইটের মেয়াদ শেষ হয়েছে এমন বই-ই কেবল যোগ করা যায়।",
    };
  }

  const existing = await prisma.bookFile.findFirst({
    where: { bookId: book.id },
    select: { id: true },
  });
  if (existing) {
    await destroy();
    return { success: false, message: "এই বইয়ের একটি ফাইল ইতিমধ্যেই আছে।" };
  }

  // The client could have uploaded anything with a valid signature, so format
  // and size come from Cloudinary's own record. NOTE: raw resources do not
  // report a `format` field, so the .pdf suffix on the public_id is the check --
  // allowed_formats already rejected non-PDFs at upload time.
  let bytes = 0;
  try {
    const asset = await cld.api.resource(parsed.data.publicId, { resource_type: "raw" });
    bytes = Number(asset.bytes) || 0;

    const inFolder = String(asset.public_id).startsWith(`${PDF_FOLDER}/`);
    const isPdf = String(asset.public_id).toLowerCase().endsWith(`.${PDF_FORMAT}`);
    if (!inFolder || !isPdf) {
      await destroy();
      return { success: false, message: "ফাইলটি পিডিএফ নয়, তাই গ্রহণ করা যায়নি।" };
    }
    if (bytes <= 0 || bytes > MAX_PDF_BYTES) {
      await destroy();
      return { success: false, message: "ফাইলটি ৫০ মেগাবাইটের বেশি বড়, তাই গ্রহণ করা যায়নি।" };
    }
  } catch {
    await destroy();
    return { success: false, message: "আপলোড করা ফাইলটি যাচাই করা যায়নি।" };
  }

  // rightsVerified is set true only here, after every gate above has passed.
  const file = await prisma.bookFile.create({
    data: {
      bookId: book.id,
      type: "FREE",
      price: null,
      publicId: parsed.data.publicId,
      fileSizeBytes: bytes,
      rightsBasis: parsed.data.rightsBasis,
      sourceUrl: parsed.data.sourceUrl || null,
      uploadedById: adminId,
      rightsVerified: true,
    },
  });

  revalidateBookCounts();
  revalidatePath("/library");
  revalidatePath("/admin/books");
  revalidatePath(`/books/${book.id}`);

  return { success: true, fileId: file.id, message: "ফাইলটি লাইব্রেরিতে যোগ করা হয়েছে।" };
}

// Paid files are out of scope. This exists so an attempt gets a clear answer
// rather than silently succeeding as FREE; there is deliberately no code path
// that would create one.
export async function createPaidBookFile(): Promise<LibraryActionResult> {
  return {
    success: false,
    message: "এই মুহূর্তে সশুল্ক ফাইল সমর্থিত নয় — লাইব্রেরিতে কেবল বিনামূল্যের পাবলিক ডোমেইন বই রাখা হয়।",
  };
}

export async function deleteBookFile(fileId: string): Promise<LibraryActionResult> {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return { success: false, message: "শুধু অ্যাডমিন ফাইল মুছতে পারবেন।" };
  }

  const file = await prisma.bookFile.findUnique({
    where: { id: fileId },
    select: { id: true, publicId: true, bookId: true },
  });
  if (!file) {
    return { success: false, message: "ফাইলটি খুঁজে পাওয়া যায়নি।" };
  }

  // Remove the remote asset too, so deleting a file does not orphan it in the
  // Cloudinary account. The DB row goes regardless -- a failed remote delete
  // should not leave a row an admin cannot get rid of.
  if (file.publicId) {
    await serverCloudinary()
      .uploader.destroy(file.publicId, { resource_type: "raw" })
      .catch(() => undefined);
  }
  await prisma.bookFile.delete({ where: { id: file.id } });

  revalidateBookCounts();
  revalidatePath("/library");
  revalidatePath("/admin/books");
  revalidatePath(`/books/${file.bookId}`);

  return { success: true, message: "ফাইলটি মুছে ফেলা হয়েছে।" };
}

// Corrects the "why is this free" note without touching the file itself. The
// note is shown publicly on the book page, so it gets the upload's rules.
export async function updateBookFileRightsBasis(fileId: string, rightsBasis: string): Promise<LibraryActionResult> {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return { success: false, message: "শুধু অ্যাডমিন ফাইলের তথ্য বদলাতে পারবেন।" };
  }

  const parsed = z.object({ fileId: z.string().trim().min(1), rightsBasis: rightsBasisSchema }).safeParse({ fileId, rightsBasis });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }

  const file = await prisma.bookFile.findUnique({
    where: { id: parsed.data.fileId },
    select: { id: true, bookId: true },
  });
  if (!file) {
    return { success: false, message: "ফাইলটি খুঁজে পাওয়া যায়নি।" };
  }

  // updateMany so a file deleted in another tab meanwhile is a plain "not
  // found" rather than a thrown error.
  const { count } = await prisma.bookFile.updateMany({
    where: { id: file.id },
    data: { rightsBasis: parsed.data.rightsBasis },
  });
  if (count === 0) {
    return { success: false, message: "ফাইলটি খুঁজে পাওয়া যায়নি।" };
  }

  revalidatePath("/admin/books");
  revalidatePath(`/books/${file.bookId}`);

  return { success: true, fileId: file.id, message: "ভিত্তি হালনাগাদ করা হয়েছে।" };
}

// Public domain files are freely readable, so this is deliberately NOT gated
// behind a session. Only an aggregate counter is kept -- no per-user download
// record exists, which is what the privacy policy describes.
export async function recordDownload(fileId: string): Promise<{ success: boolean }> {
  try {
    await prisma.bookFile.update({
      where: { id: fileId },
      data: { downloadCount: { increment: 1 } },
    });
    return { success: true };
  } catch {
    // A missing file should not break the download the user already started.
    return { success: false };
  }
}
