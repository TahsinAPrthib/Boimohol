// Pure, dependency-free: safe to import from client components.
import { bn, bnFixed } from "@/lib/bangla";
// The Cloudinary Node SDK must NOT be imported here — it pulls in `fs` and
// breaks the client bundle. Server-only helpers live in cloudinary-server.ts.

export const MAX_PHOTOS_PER_LISTING = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"] as const;
export const UPLOAD_FOLDER = "listings";

// Builds a delivery URL from a public_id with transforms applied, rather than
// storing/serving originals. f_auto picks webp/avif per browser, q_auto picks
// a quality, and w_ caps the delivered width for the context it's used in.
export function cloudinaryUrl(
  publicId: string,
  { width, square = false }: { width: number; square?: boolean }
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const transforms = [
    "f_auto",
    "q_auto",
    `w_${width}`,
    // Cards need a predictable aspect ratio; detail views keep their shape.
    ...(square ? ["ar_1:1", "c_fill", "g_auto"] : ["c_limit"]),
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

// ---------------------------------------------------------------- library PDFs

export const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB
export const PDF_FOLDER = "books";
export const PDF_FORMAT = "pdf";

// PDFs are stored as Cloudinary "raw" resources, so they are delivered from
// /raw/upload/ and NOT from /image/upload/. No transforms apply: a raw asset is
// served back byte-for-byte. The public_id already carries the .pdf extension.
export function pdfUrl(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;
}

// Bangla numerals, to match the hand-written numbers elsewhere in the UI.
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bn(bytes)} বাইট`;
  if (bytes < 1024 * 1024) return `${bn(Math.round(bytes / 1024))} কিলোবাইট`;
  return `${bnFixed(bytes / (1024 * 1024))} মেগাবাইট`;
}
