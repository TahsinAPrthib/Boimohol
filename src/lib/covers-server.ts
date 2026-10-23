import "server-only";
import { serverCloudinary } from "@/lib/cloudinary-server";
import { checkUploaded, COVER_FOLDER, COVER_FORMATS, MAX_COVER_BYTES, parseCoverUrl, type UploadedCover } from "@/lib/covers";

// Copies a cover from an allowed source into Cloudinary. Cloudinary fetches
// the image itself; when the source refuses Cloudinary (Wikimedia rate-limits
// its fetcher now and then), the server downloads the image with its own
// identifying User-Agent and hands Cloudinary the bytes. Either way the
// result is checked against Cloudinary's own record of it: an image, no
// larger than MAX_COVER_BYTES, big enough to show and shaped like a book.

const USER_AGENT = "BoiMohol/1.0 (https://boimohol-delta.vercel.app; tahsinaparthib1@gmail.com) covers";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const TIMEOUT_MS = 20_000;

export type CopiedCover = { ok: true; publicId: string; sourceUrl: string; bytes: number; width: number; height: number } | { ok: false; error: string };

// A Commons file page -> the image to fetch: the file itself, or for a PDF or
// DjVu the given page rendered by Wikimedia (960px, one of its standard
// thumbnail widths).
async function commonsImage(file: string, page: number | null): Promise<string | null> {
  const url = new URL(COMMONS_API);
  const params: Record<string, string> = {
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo",
    iiprop: "url|mime",
    titles: `File:${file}`,
    iiurlwidth: "960",
  };
  if (page || /\.(pdf|djvu|tiff?)$/i.test(file)) params.iiurlparam = `page${page ?? 1}-960px`;
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    const j = (await res.json()) as { query?: { pages?: { imageinfo?: { thumburl?: string; url?: string }[] }[] } };
    const ii = j.query?.pages?.[0]?.imageinfo?.[0];
    const found = ii?.thumburl ?? ii?.url;
    return found ? found.replace(/\?.*$/, "") : null;
  } catch {
    return null;
  }
}

async function download(url: string): Promise<{ type: string; bytes: Buffer } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!res.ok || !/^image\/(jpeg|png|webp)$/.test(type)) return null;
    if (Number(res.headers.get("content-length") ?? 0) > MAX_COVER_BYTES) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return bytes.length > 0 && bytes.length <= MAX_COVER_BYTES ? { type, bytes } : null;
  } catch {
    return null;
  }
}

export async function destroyCover(publicId: string): Promise<void> {
  await serverCloudinary()
    .uploader.destroy(publicId, { invalidate: true })
    .catch((err) => console.error(`[covers] could not delete ${publicId} from Cloudinary: ${err instanceof Error ? err.message : err}`));
}

export async function copyCoverToCloudinary(rawUrl: string, bookId: string): Promise<CopiedCover> {
  const parsed = parseCoverUrl(rawUrl);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const fetchUrl = parsed.site === "commons-page" ? await commonsImage(parsed.file, parsed.page) : parsed.fetchUrl;
  if (!fetchUrl) return { ok: false, error: "কমন্সে ফাইলটি বা তার পাতাটি পাওয়া যায়নি।" };
  // A resolved Commons image must still be one of Wikimedia's own files.
  const resolved = parseCoverUrl(fetchUrl);
  if (!resolved.ok || resolved.site === "commons-page") return { ok: false, error: "কমন্সের ছবির ঠিকানাটি চেনা যায়নি।" };
  const target = resolved.site === "wikimedia" || resolved.site === "gutenberg" ? resolved.fetchUrl : fetchUrl;

  const cld = serverCloudinary();
  const options = {
    folder: COVER_FOLDER,
    public_id: `${bookId.replace(/[^\w-]+/g, "-").slice(0, 80)}-${Date.now().toString(36)}`,
    resource_type: "image" as const,
    allowed_formats: [...COVER_FORMATS],
    overwrite: false,
  };
  let uploaded: UploadedCover;
  try {
    uploaded = (await cld.uploader.upload(target, options)) as UploadedCover;
  } catch (err) {
    const message = (err as { message?: string; error?: { message?: string } })?.error?.message ?? (err as Error)?.message ?? "";
    if (!/Error in loading|Too Many Requests|403|429|timeout/i.test(message)) {
      console.error(`[covers] Cloudinary refused ${target}: ${message}`);
      return { ok: false, error: "ছবিটি Cloudinary-তে তোলা যায়নি (ফরম্যাট বা আকার ঠিক নেই)।" };
    }
    const image = await download(target);
    if (!image) return { ok: false, error: "উৎস থেকে ছবিটি আনা যায়নি; একটু পরে আবার চেষ্টা করুন।" };
    try {
      uploaded = (await cld.uploader.upload(`data:${image.type};base64,${image.bytes.toString("base64")}`, options)) as UploadedCover;
    } catch (again) {
      console.error(`[covers] uploading downloaded bytes failed: ${again instanceof Error ? again.message : again}`);
      return { ok: false, error: "ছবিটি Cloudinary-তে তোলা যায়নি।" };
    }
  }
  const problem = checkUploaded(uploaded);
  if (problem) {
    await destroyCover(uploaded.public_id);
    return { ok: false, error: problem };
  }
  return { ok: true, publicId: uploaded.public_id, sourceUrl: parsed.sourceUrl, bytes: uploaded.bytes, width: uploaded.width, height: uploaded.height };
}
