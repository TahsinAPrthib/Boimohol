// Pure, dependency-free: safe to import from client components.
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
