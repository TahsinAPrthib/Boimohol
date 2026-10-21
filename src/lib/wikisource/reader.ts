import "server-only";
import { cache } from "react";
import { canBePublicDomain } from "@/lib/public-domain";
import { readCache, readCacheMany, writeCache } from "./cache";
import { fetchPage, fetchScanInfo, fetchSubpages, WikisourceMissing, WikisourceUnavailable, type ScanFile } from "./api";
import { linksBelow, sanitizeWikisourceHtml, SANITIZER_VERSION, scanFiles } from "./sanitize";
import { pathInWork, titleInWork, workRootFromUrl } from "./titles";

// The in-site reader's data: a work's contents and its pages, fetched live
// from the Wikisource API, cleaned (sanitize.ts) and cached (cache.ts):
// fetched again once a week. When Wikisource can't be reached, an older copy
// is shown if the cache still has one; otherwise the page offers the link
// to Wikisource.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SECTION_FETCHES = 12;
const MAX_PAGE_CHARS = 4_000_000;

export type TocEntry = { path: string; label: string };
export type Contents = {
  root: string; // the main page, after any redirect
  entries: TocEntry[]; // every page below it, in reading order
  frontHtml: string; // the main page itself, cleaned
  frontTextLength: number;
  scans: ScanFile[];
};
export type ChapterPage = { path: string; html: string; scans: ScanFile[] };
export type Loaded<T> = { ok: true; value: T; stale: boolean } | { ok: false; reason: "unavailable" | "missing" };

// The book's Wikisource work, when it can be read here: a bn.wikisource.org
// link on a book that passes the public-domain rule today (the same rule as
// every free copy on the site).
export function readerSource(book: {
  isPublicDomain: boolean;
  authorDeathYear: number | null;
  sources: { kind: string; url: string }[];
}): { root: string; url: string } | null {
  if (!book.isPublicDomain || !canBePublicDomain(book.authorDeathYear)) return null;
  for (const s of book.sources) {
    if (s.kind !== "WIKISOURCE") continue;
    const root = workRootFromUrl(s.url);
    if (root) return { root, url: s.url };
  }
  return null;
}

async function cached<T>(key: string, load: () => Promise<T>): Promise<Loaded<T>> {
  const row = await readCache(key);
  if (row && Date.now() - row.fetchedAt.getTime() < WEEK_MS) return { ok: true, value: row.data as T, stale: false };
  try {
    const value = await load();
    await writeCache(key, value);
    return { ok: true, value, stale: false };
  } catch (err) {
    if (err instanceof WikisourceMissing) return { ok: false, reason: "missing" };
    if (!(err instanceof WikisourceUnavailable)) throw err;
    console.error(`[reader] Wikisource unavailable for ${key}: ${err.message}`);
    return row ? { ok: true, value: row.data as T, stale: true } : { ok: false, reason: "unavailable" };
  }
}

// Commons PDFs for the scan files a page names, each looked up once a week.
// A failed lookup only means no scan link is shown.
async function scanInfo(names: string[]): Promise<ScanFile[]> {
  const pdfs = [...new Set(names)].filter((n) => /\.pdf$/i.test(n)).slice(0, 10);
  if (pdfs.length === 0) return [];
  const keyOf = (n: string) => `scan:${n}`;
  const rows = await readCacheMany(pdfs.map(keyOf));
  const known = new Map(
    rows.filter((r) => Date.now() - r.fetchedAt.getTime() < WEEK_MS).map((r) => [r.key, (r.data as { file: ScanFile | null }).file])
  );
  const unknown = pdfs.filter((n) => !known.has(keyOf(n)));
  if (unknown.length) {
    try {
      for (const { name, file } of await fetchScanInfo(unknown)) {
        known.set(keyOf(name), file);
        await writeCache(keyOf(name), { file });
      }
    } catch (err) {
      console.error(`[reader] scan lookup failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  return pdfs.map((n) => known.get(keyOf(n))).filter((f): f is ScanFile => !!f);
}

// A link's text as a contents label; the page's own name when the text is
// only a page number or missing.
function labelFor(path: string, text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean || clean.length > 120 || /^[\d০-৯\s.,:;()\-–—]+$/.test(clean)) return path.split("/").pop() ?? path;
  return clean;
}

async function buildContents(bookId: string, storedRoot: string): Promise<Contents> {
  const main = await fetchPage(storedRoot);
  if (main.html.length > MAX_PAGE_CHARS) throw new WikisourceUnavailable("main page too large");
  const root = main.title;
  const all = await fetchSubpages(root);
  const complete = all.length < 1500;
  const existing = new Set(all);
  const scanNames = new Set(scanFiles(main.html));
  const entries: TocEntry[] = [];
  const placed = new Set<string>();
  let sectionFetches = 0;

  // In the order the main page links them; a section page that has pages of
  // its own is followed by them, in the order the section page links them;
  // anything still unplaced follows, in title order.
  async function place(title: string, text: string): Promise<void> {
    if (placed.has(title) || (complete && !existing.has(title))) return;
    const path = pathInWork(root, title);
    if (!path) return;
    placed.add(title);
    entries.push({ path, label: labelFor(path, text) });
    const below = all.filter((t) => t.startsWith(`${title}/`) && !placed.has(t));
    if (below.length === 0) return;
    if (sectionFetches < MAX_SECTION_FETCHES) {
      sectionFetches++;
      const section = await fetchPage(title);
      for (const n of scanFiles(section.html)) scanNames.add(n);
      for (const link of linksBelow(section.html, title)) await place(link.title, link.text);
    }
    for (const t of below) await place(t, "");
  }
  for (const link of linksBelow(main.html, root)) await place(link.title, link.text);
  for (const t of all) await place(t, "");

  // A main page that only lists the chapters names no scan; the first
  // chapter does (and is kept, so reading it costs nothing more).
  if (scanNames.size === 0 && entries.length > 0) {
    const first = await fetchPage(titleInWork(root, entries[0].path));
    for (const n of scanFiles(first.html)) scanNames.add(n);
    await writeCache(pageKey(bookId, first.title), await chapterFrom(bookId, root, entries[0].path, first));
  }

  const front = sanitizeWikisourceHtml(main.html, { bookId, root, current: root });
  return { root, entries, frontHtml: front.html, frontTextLength: front.textLength, scans: await scanInfo([...scanNames]) };
}

const contentsKey = (bookId: string, root: string) => `v${SANITIZER_VERSION}:contents:${bookId}:${root}`;
const pageKey = (bookId: string, title: string) => `v${SANITIZER_VERSION}:page:${bookId}:${title}`;

export function getContents(bookId: string, storedRoot: string): Promise<Loaded<Contents>> {
  return cached(contentsKey(bookId, storedRoot), () => buildContents(bookId, storedRoot));
}

// Once per request, however many layouts and pages ask.
export const loadContents = cache(getContents);

async function chapterFrom(bookId: string, root: string, path: string, page: { title: string; html: string }): Promise<ChapterPage> {
  if (page.html.length > MAX_PAGE_CHARS) throw new WikisourceUnavailable("page too large");
  const clean = sanitizeWikisourceHtml(page.html, { bookId, root, current: page.title });
  return { path, html: clean.html, scans: await scanInfo(scanFiles(page.html)) };
}

// A page of the work. The caller checks that `path` is one of the work's
// entries, so only the work's own pages are ever fetched.
export function getChapter(bookId: string, root: string, path: string): Promise<Loaded<ChapterPage>> {
  const title = titleInWork(root, path);
  return cached(pageKey(bookId, title), async () => {
    const page = await fetchPage(title);
    // Redirected out of the work: not one of its pages.
    if (pathInWork(root, page.title) === null) throw new WikisourceMissing("redirected outside the work");
    return chapterFrom(bookId, root, path, page);
  });
}
