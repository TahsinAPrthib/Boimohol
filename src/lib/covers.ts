// Real book covers: where they may come from, how they are credited, and how
// they are delivered. Pure and dependency-free, so client components can use
// it too.
//
// A cover may only be an image that is itself free to use: the cover or
// title page of a public-domain book's own scan on Wikimedia Commons or
// Wikisource (served from upload.wikimedia.org), or a Project Gutenberg cover
// that is a scan of an original edition. Covers are copied into Cloudinary;
// the site never hotlinks them.

export const COVER_FOLDER = "covers";
export const COVER_FORMATS = ["jpg", "png", "webp"] as const;
export const MAX_COVER_BYTES = 10 * 1024 * 1024;

export type CoverSource =
  | { ok: true; site: "wikimedia"; fetchUrl: string; sourceUrl: string }
  | { ok: true; site: "commons-page"; file: string; page: number | null; sourceUrl: string }
  | { ok: true; site: "gutenberg"; fetchUrl: string; sourceUrl: string }
  | { ok: false; error: string };

const NOT_ALLOWED =
  "প্রচ্ছদের ছবি শুধু উইকিমিডিয়া (upload.wikimedia.org, commons.wikimedia.org) বা প্রজেক্ট গুটেনবার্গ (gutenberg.org) থেকে নেওয়া যায়।";
const IMAGE_PATH = /\.(jpe?g|png|webp)$/i;

function safeDecode(s: string): string | null {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}
const fileTitleUrl = (host: string, file: string, page: number | null) =>
  `https://${host}/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}${page ? `?page=${page}` : ""}`;

// Checks a cover URL against the allowed sources (by parsing it, never by
// pattern-matching the whole string) and works out the page that credits it.
export function parseCoverUrl(raw: string): CoverSource {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, error: "ঠিকানাটি সঠিক নয়।" };
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return { ok: false, error: NOT_ALLOWED };
  const host = url.hostname.toLowerCase();

  // A file on Wikimedia's servers: a Commons file ("wikipedia/commons") or one
  // kept on Bangla Wikisource ("wikisource/bn"); the original, or a thumbnail
  // or a rendered page of a PDF/DjVu scan ("thumb/a/ab/File.pdf/page3-960px-File.pdf.jpg").
  if (host === "upload.wikimedia.org" || host === "thumb.wikimedia.org") {
    const m = url.pathname.match(/^\/(wikipedia\/commons|wikisource\/bn)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)(?:\/(?:page(\d+)-)?\d+px-[^/]+)?$/);
    if (!m) return { ok: false, error: "উইকিমিডিয়ার ফাইলের ঠিকানাটি চেনা যায়নি।" };
    const file = safeDecode(m[2])?.replace(/_/g, " ");
    if (!file) return { ok: false, error: "ঠিকানাটি সঠিক নয়।" };
    const thumb = url.pathname.includes("/thumb/");
    if (!thumb && !IMAGE_PATH.test(url.pathname)) return { ok: false, error: "পিডিএফ বা ডিজেভিইউ স্ক্যানের একটি পাতার ছবির ঠিকানা দিন, পুরো ফাইলের নয়।" };
    const page = m[3] ? Number(m[3]) : null;
    return {
      ok: true,
      site: "wikimedia",
      // Thumbnails are fetched through thumb.wikimedia.org, Wikimedia's own
      // thumbnail host: upload.wikimedia.org throttles Cloudinary's fetcher
      // (429) for rendered scan pages.
      fetchUrl: `https://${thumb ? "thumb.wikimedia.org" : "upload.wikimedia.org"}${url.pathname}`,
      sourceUrl: fileTitleUrl(m[1] === "wikisource/bn" ? "bn.wikisource.org" : "commons.wikimedia.org", file, page),
    };
  }

  // A Commons file page; for a PDF or DjVu, ?page=N picks the page.
  if (host === "commons.wikimedia.org") {
    let name: string | null = null;
    if (url.pathname.startsWith("/wiki/")) name = safeDecode(url.pathname.slice("/wiki/".length));
    else if (url.pathname === "/w/index.php") name = url.searchParams.get("title");
    const file = name?.match(/^(?:File|Image|চিত্র):(.+)$/)?.[1]?.replace(/_/g, " ");
    if (!file) return { ok: false, error: "কমন্সের একটি ফাইলের পাতার ঠিকানা দিন (File:...)।" };
    const pageParam = url.searchParams.get("page");
    const page = pageParam && /^\d{1,4}$/.test(pageParam) ? Number(pageParam) : null;
    return { ok: true, site: "commons-page", file, page, sourceUrl: fileTitleUrl("commons.wikimedia.org", file, page) };
  }

  // A Gutenberg ebook's cover: the producer's (images/...) or the catalog's
  // cover.medium.jpg.
  if (host === "www.gutenberg.org" || host === "gutenberg.org") {
    const m = url.pathname.match(/^\/(?:cache\/epub|files)\/(\d+)\/(?:[\w.-]+\/)*[\w.-]+$/);
    if (!m || !IMAGE_PATH.test(url.pathname)) return { ok: false, error: "গুটেনবার্গের একটি বইয়ের প্রচ্ছদের ছবির ঠিকানা দিন।" };
    return { ok: true, site: "gutenberg", fetchUrl: `https://www.gutenberg.org${url.pathname}`, sourceUrl: `https://www.gutenberg.org/ebooks/${m[1]}` };
  }

  return { ok: false, error: NOT_ALLOWED };
}

// For an uploaded file: where it came from must still be one of the allowed
// sources (its page, not just any URL).
export function isAllowedCoverSourceUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
    return ["upload.wikimedia.org", "thumb.wikimedia.org", "commons.wikimedia.org", "bn.wikisource.org", "www.gutenberg.org", "gutenberg.org"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

// Cloudinary's record of a cover it holds, checked against the rules: in the
// covers folder, an image format allowed, no larger than MAX_COVER_BYTES, big
// enough to show, and upright like a book (a two-page spread or a strip is
// refused). Null when it passes, else the reason in Bangla.
export type UploadedCover = { public_id: string; format: string; bytes: number; width: number; height: number };

export function checkUploaded(u: UploadedCover): string | null {
  if (!String(u.public_id).startsWith(`${COVER_FOLDER}/`)) return "ছবিটি প্রচ্ছদের ফোল্ডারে নেই।";
  if (!(COVER_FORMATS as readonly string[]).includes(String(u.format))) return "ছবিটি JPG, PNG বা WebP নয়।";
  if (!(u.bytes > 0 && u.bytes <= MAX_COVER_BYTES)) return "ছবিটি ১০ মেগাবাইটের বেশি বড়।";
  if (!(u.width >= 150 && u.height >= 200)) return "ছবিটি প্রচ্ছদ হিসেবে দেখানোর পক্ষে খুব ছোট।";
  const ratio = u.width / u.height;
  if (ratio < 0.4 || ratio > 1.05) return "ছবিটি বইয়ের প্রচ্ছদের মতো খাড়া নয়।";
  return null;
}

// "প্রচ্ছদের উৎস: উইকিমিডিয়া কমন্স" on the book page.
export function coverSourceLabel(sourceUrl: string): string {
  try {
    const host = new URL(sourceUrl).hostname;
    if (host === "bn.wikisource.org") return "উইকিসংকলন";
    if (host.endsWith("gutenberg.org")) return "প্রজেক্ট গুটেনবার্গ";
    return "উইকিমিডিয়া কমন্স";
  } catch {
    return "উইকিমিডিয়া কমন্স";
  }
}

// Delivery: the cover cropped to the book frame's 2:3, in the browser's best
// format and quality, at the width the context needs -- never enlarged past
// the image's own size (c_lfill); the frame's CSS crops any image too small to
// be cropped here.
export function coverUrl(publicId: string, width: number): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_lfill,ar_2:3,g_center,w_${width}/${publicId}`;
}

export function coverSrcSet(publicId: string, widths: readonly number[]): string {
  return widths.map((w) => `${coverUrl(publicId, w)} ${w}w`).join(", ");
}

// Sizes per context: what the cover's box measures, and the widths offered
// for 1x-3x screens.
export const COVER_SIZES = {
  // Cards on shelves and grids: 2 columns on a phone, up to 6 on a wide screen.
  card: { sizes: "(min-width: 768px) 180px, 45vw", widths: [160, 240, 360, 480] },
  // The book page's cover, at most 200px wide.
  detail: { sizes: "200px", widths: [200, 400, 600] },
  // Small covers in lists (a profile's shelf, admin).
  small: { sizes: "80px", widths: [80, 160, 240] },
} as const;
export type CoverContext = keyof typeof COVER_SIZES;
