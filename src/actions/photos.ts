"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";
import { getSessionUserId } from "@/lib/authz";
import { serverCloudinary } from "@/lib/cloudinary-server";
import {
  ALLOWED_FORMATS,
  MAX_PHOTOS_PER_LISTING,
  MAX_PHOTO_BYTES,
  UPLOAD_FOLDER,
} from "@/lib/cloudinary-url";

export type UploadSignature = {
  success: boolean;
  message?: string;
  signature?: string;
  timestamp?: number;
  apiKey?: string;
  cloudName?: string;
  folder?: string;
  allowedFormats?: string;
};

export type PhotoActionResult = {
  success: boolean;
  message?: string;
  attached?: number;
};

// Only these upload params are signable. NOTE: max_file_size is deliberately
// absent — Cloudinary excludes it when computing the expected signature, so
// including it here produces "Invalid Signature". Size is enforced instead in
// attachPhotosToListing, against the authoritative byte count from the Admin
// API, and oversized assets are destroyed rather than attached.
function signedParams(timestamp: number) {
  return {
    timestamp,
    folder: UPLOAD_FOLDER,
    allowed_formats: ALLOWED_FORMATS.join(","),
  };
}

export async function getUploadSignature(): Promise<UploadSignature> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "ছবি যোগ করতে হলে আগে লগইন করুন।" };
  }

  const secret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!secret || !apiKey || !cloudName) {
    return { success: false, message: "ছবি আপলোডের সেটআপ সম্পূর্ণ নয়।" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = signedParams(timestamp);

  // The secret is used here only to compute the signature; it is never part
  // of the returned payload.
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

const publicIdSchema = z
  .array(z.string().trim().min(1).max(300))
  .min(1, "কোনো ছবি পাওয়া যায়নি।")
  .max(MAX_PHOTOS_PER_LISTING, `সর্বোচ্চ ${bn(MAX_PHOTOS_PER_LISTING)}টি ছবি দেওয়া যাবে।`);

// Verifies each uploaded asset against the Cloudinary Admin API before it is
// attached: the client could have uploaded anything with a valid signature,
// so format and size are confirmed from the authoritative record. Anything
// that fails is destroyed so it doesn't linger in the account.
async function verifyOrDestroy(publicIds: string[]): Promise<{ ok: string[]; rejected: string[] }> {
  const cld = serverCloudinary();
  const ok: string[] = [];
  const rejected: string[] = [];

  for (const publicId of publicIds) {
    try {
      const asset = await cld.api.resource(publicId);
      const formatOk = (ALLOWED_FORMATS as readonly string[]).includes(String(asset.format));
      const sizeOk = Number(asset.bytes) <= MAX_PHOTO_BYTES;
      const folderOk = String(asset.public_id).startsWith(`${UPLOAD_FOLDER}/`);

      if (formatOk && sizeOk && folderOk) {
        ok.push(publicId);
      } else {
        rejected.push(publicId);
        await cld.uploader.destroy(publicId).catch(() => undefined);
      }
    } catch {
      // Unknown public_id — nothing to attach, nothing to clean up.
      rejected.push(publicId);
    }
  }

  return { ok, rejected };
}

export async function attachPhotosToListing(
  listingId: string,
  publicIds: string[]
): Promise<PhotoActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "ছবি যোগ করতে হলে আগে লগইন করুন।" };
  }

  const parsed = publicIdSchema.safeParse(publicIds);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, _count: { select: { photos: true } } },
  });
  if (!listing) {
    return { success: false, message: "তালিকাটি খুঁজে পাওয়া যায়নি।" };
  }
  if (listing.sellerId !== userId) {
    return { success: false, message: "শুধু বিক্রেতা নিজেই এই তালিকায় ছবি যোগ করতে পারবেন।" };
  }

  const existing = listing._count.photos;
  if (existing + parsed.data.length > MAX_PHOTOS_PER_LISTING) {
    const room = Math.max(0, MAX_PHOTOS_PER_LISTING - existing);
    return {
      success: false,
      message:
        room === 0
          ? `একটি তালিকায় সর্বোচ্চ ${bn(MAX_PHOTOS_PER_LISTING)}টি ছবি রাখা যায়। নতুন ছবি যোগ করতে হলে আগে কিছু ছবি মুছে ফেলুন।`
          : `একটি তালিকায় সর্বোচ্চ ${bn(MAX_PHOTOS_PER_LISTING)}টি ছবি রাখা যায়। আপনি আর ${bn(room)}টি ছবি যোগ করতে পারবেন।`,
    };
  }

  const { ok, rejected } = await verifyOrDestroy(parsed.data);
  if (ok.length === 0) {
    return { success: false, message: "ছবিগুলো গ্রহণ করা যায়নি — ফরম্যাট বা আকার ঠিক নেই।" };
  }

  await prisma.listingPhoto.createMany({
    data: ok.map((publicId, i) => ({ listingId, publicId, order: existing + i })),
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath(`/marketplace/${listingId}/edit`);

  return {
    success: true,
    attached: ok.length,
    message:
      rejected.length > 0
        ? `${bn(ok.length)}টি ছবি যোগ হয়েছে, ${bn(rejected.length)}টি বাদ পড়েছে (ফরম্যাট বা আকার ঠিক নেই)।`
        : `${bn(ok.length)}টি ছবি যোগ হয়েছে।`,
  };
}

export async function deletePhoto(photoId: string): Promise<PhotoActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "ছবি মুছতে হলে আগে লগইন করুন।" };
  }

  const photo = await prisma.listingPhoto.findUnique({
    where: { id: photoId },
    select: { publicId: true, listingId: true, listing: { select: { sellerId: true } } },
  });
  if (!photo) {
    return { success: false, message: "ছবিটি খুঁজে পাওয়া যায়নি।" };
  }
  if (photo.listing.sellerId !== userId) {
    return { success: false, message: "শুধু বিক্রেতা নিজেই এই ছবিটি মুছতে পারবেন।" };
  }

  // Remove the remote asset too, so deleting a photo doesn't orphan a file in
  // the Cloudinary account. The DB row goes regardless — a failed remote
  // delete shouldn't leave a photo the user can't get rid of.
  await serverCloudinary().uploader.destroy(photo.publicId).catch(() => undefined);
  await prisma.listingPhoto.delete({ where: { id: photoId } });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${photo.listingId}`);
  revalidatePath(`/marketplace/${photo.listingId}/edit`);

  return { success: true, message: "ছবিটি মুছে ফেলা হয়েছে।" };
}
