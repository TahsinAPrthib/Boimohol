// Prepares real cover images for the catalog's public-domain books. Nothing
// is written to any database or to Cloudinary: the output is an import file
// for /admin/books, where the server fetches each image into Cloudinary.
//
//   npx tsx --env-file=.env scripts/covers-prepare.ts collect    books and candidate images
//   npx tsx --env-file=.env scripts/covers-prepare.ts download   review copies, for checking by eye
//   npx tsx --env-file=.env scripts/covers-prepare.ts write      apply scripts/covers/decisions.ts
//
// Writes data/covers-import.json (-1, -2 ... past 500 rows) and
// data/covers-report.md. Working files go to data/.covers-cache/ (ignored).
//
// The rules (decided 2026-10-22):
// - only images that are themselves free: the cover or title page of the
//   book's own scan on Wikimedia Commons or Wikisource, or a Project
//   Gutenberg cover that is a scan of an original edition -- never
//   Gutenberg's generated covers or a producer's modern composite, never a
//   modern publisher's cover art, never another site;
// - pictorial cover art counts as a separate work: used only when its
//   artist died in the cutoff year or earlier, or it is unsigned (an
//   anonymous work, protected 60 years from publication) on an edition
//   published by the cutoff year;
// - only books that pass the public-domain rule;
// - every image checked by eye (decisions.ts): the right book, legible, not
//   a modern edition's cover.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchCompleteIndexes } from "./wikisource/indexes";
import { buildCandidates, type Candidate } from "./wikisource/candidates";
import { postForm, USER_AGENT, WIKISOURCE_API } from "./wikisource/http";
import { canBePublicDomain } from "../src/lib/public-domain";
import { bookKeys } from "../src/lib/book-catalog";
import { bookUpdateRowSchema } from "../src/lib/book-schema";
import { scanFiles } from "../src/lib/wikisource/sanitize";

const CACHE = "data/.covers-cache";
const IMG = join(CACHE, "img");
const CANDIDATES = join(CACHE, "candidates.json");
const MAX_IMPORT_ROWS = 500;
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Row = {
  title: string;
  titleBangla: string | null;
  author: string;
  isPublicDomain: boolean;
  authorDeathYear: number | null;
  sources?: { url: string; rightsBasis: string }[];
};

export type CoverBook = {
  key: string; // the first bookKey: stable identity for decisions
  title: string;
  titleBangla: string | null;
  author: string;
  authorDeathYear: number;
  rightsBasis: string | null; // the book's free-copy note, for its death-year wording
  wikisource: { root: string; file: string; page: number; editionYear: number | null; repo: string | null; mime: string | null; license: string | null; image: string | null; review: string | null }[];
  gutenberg: { id: number; medium: string; full: string | null; review: string }[];
  commons: { file: string; page: number | null; image: string; review: string; description: string }[];
};

// ---------------------------------------------------------------- collect

function rowsFrom(file: string): Row[] {
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Row[]) : [];
}

async function catalogBooks(): Promise<Row[]> {
  if (!process.env.DATABASE_URL) return [];
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    // With the links each book already has, so works linked by hand reach their scans too.
    return await prisma.book.findMany({
      select: { title: true, titleBangla: true, author: true, isPublicDomain: true, authorDeathYear: true, sources: { select: { url: true, rightsBasis: true } } },
    });
  } finally {
    await prisma.$disconnect();
  }
}

const wsRoot = (url: string) => {
  const m = url.match(/^https:\/\/bn\.wikisource\.org\/wiki\/(.+)$/);
  return m ? decodeURIComponent(m[1]).replace(/_/g, " ") : null;
};
const gutenbergId = (url: string) => Number(url.match(/^https:\/\/www\.gutenberg\.org\/ebooks\/(\d+)$/)?.[1] ?? NaN);

// One page of a PDF or DjVu (or a plain image) as a JPEG rendered by
// Wikimedia, at one of its standard thumbnail widths.
async function rendered(api: string, file: string, page: number | null, width: number) {
  const params: Record<string, string> = {
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo",
    titles: `File:${file}`,
    iiprop: "url|mime|size|extmetadata",
    iiextmetadatafilter: "LicenseShortName",
    iiurlwidth: String(width),
  };
  if (page) params.iiurlparam = `page${page}-${width}px`;
  const j = await postForm<{ query?: { pages?: { imagerepository?: string; imageinfo?: { thumburl?: string; mime?: string; extmetadata?: { LicenseShortName?: { value?: string } } }[] }[] } }>(api, params);
  const p = j.query?.pages?.[0];
  const ii = p?.imageinfo?.[0];
  const clean = (u?: string) => (u ? u.replace(/\?.*$/, "") : null);
  return { repo: p?.imagerepository ?? null, mime: ii?.mime ?? null, license: ii?.extmetadata?.LicenseShortName?.value ?? null, image: clean(ii?.thumburl) };
}

// The reader's own lookup (src/lib/wikisource/reader.ts): the scan files a
// work's page transcludes, or its first subpage's when the main page only
// lists chapters. Used for works the index mapping doesn't connect to a scan.
async function readerScan(root: string): Promise<string | null> {
  const html = async (page: string) =>
    (await postForm<{ parse?: { text?: string } }>(WIKISOURCE_API, { action: "parse", format: "json", formatversion: "2", page, prop: "text", redirects: "1" }).catch(() => ({ parse: undefined }))).parse?.text ?? "";
  let files = scanFiles(await html(root));
  if (files.length === 0) {
    const sub = await postForm<{ query?: { allpages?: { title: string }[] } }>(WIKISOURCE_API, {
      action: "query",
      format: "json",
      formatversion: "2",
      list: "allpages",
      apnamespace: "0",
      apprefix: `${root}/`,
      aplimit: "1",
    }).catch(() => ({ query: undefined }));
    const first = sub.query?.allpages?.[0]?.title;
    if (first) files = scanFiles(await html(first));
  }
  return files.sort((a, b) => a.localeCompare(b, "bn"))[0] ?? null;
}

async function collect() {
  mkdirSync(CACHE, { recursive: true });
  const rows = [
    ...(await catalogBooks()),
    ...rowsFrom("data/catalog-import.json"),
    ...rowsFrom("data/wikisource-import.json"),
    ...rowsFrom("data/wikisource-import-2.json"),
    ...rowsFrom("data/gutenberg-import-1.json"),
    ...rowsFrom("data/gutenberg-import-2.json"),
  ];
  // One entry per book, as the admin import would match them.
  const byKey = new Map<string, { row: Row; roots: Set<string>; ids: Set<number>; note: string | null }>();
  for (const row of rows) {
    const keys = bookKeys(row);
    const hit = keys.map((k) => byKey.get(k)).find(Boolean);
    const entry = hit ?? { row, roots: new Set<string>(), ids: new Set<number>(), note: null };
    for (const s of row.sources ?? []) {
      const root = wsRoot(s.url);
      if (root) entry.roots.add(root);
      const id = gutenbergId(s.url);
      if (Number.isFinite(id)) entry.ids.add(id);
      entry.note ??= s.rightsBasis;
    }
    for (const k of keys) byKey.set(k, entry);
  }
  const entries = [...new Set(byKey.values())].filter((e) => e.row.isPublicDomain && canBePublicDomain(e.row.authorDeathYear));
  console.log(`books known: ${new Set(byKey.values()).size}; public domain: ${entries.length}`);

  // Wikisource works -> their scans (the import pipeline's own mapping).
  const indexes = await fetchCompleteIndexes();
  const cands = await buildCandidates(indexes);
  const scansOf = new Map<string, Candidate[]>();
  for (const c of cands) if (c.mainPage) scansOf.set(c.mainPage, [...(scansOf.get(c.mainPage) ?? []), c]);

  const books: CoverBook[] = [];
  let n = 0;
  for (const e of entries) {
    n++;
    if (n % 50 === 0) console.log(`  ${n}/${entries.length}`);
    const b: CoverBook = {
      key: bookKeys(e.row)[0],
      title: e.row.title,
      titleBangla: e.row.titleBangla,
      author: e.row.author,
      authorDeathYear: e.row.authorDeathYear!,
      rightsBasis: e.note,
      wikisource: [],
      gutenberg: [],
      commons: [],
    };
    for (const root of e.roots) {
      // The first scan (several are volumes of one work), at the page its
      // index names as the cover; else the scan the reader finds, from page 1.
      const c = (scansOf.get(root) ?? []).sort((x, y) => x.index.file.localeCompare(y.index.file, "bn"))[0];
      const file = c?.index.file ?? (await readerScan(root));
      if (!file) continue;
      const page = Number(String(c?.index.fields.Image ?? "").replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))) || 1;
      const paged = /\.(pdf|djvu)$/i.test(file);
      const big = await rendered(WIKISOURCE_API, file, paged ? page : null, 960);
      const small = await rendered(WIKISOURCE_API, file, paged ? page : null, 500);
      if (!big.image) continue;
      b.wikisource.push({ root, file, page, editionYear: c?.editionYear ?? null, ...big, review: small.image });
    }
    for (const id of e.ids) {
      b.gutenberg.push({
        id,
        medium: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
        full: null, // probed in `download`
        review: `https://gutenberg.pglaf.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
      });
    }
    books.push(b);
  }

  // Public-domain books with neither: search Commons for a scan of the book.
  for (const b of books.filter((x) => x.wikisource.length === 0 && x.gutenberg.length === 0)) {
    for (const q of [`${b.titleBangla ?? ""} ${b.author}`.trim(), `${b.title} ${b.author}`]) {
      const j = await postForm<{ query?: { search?: { title: string }[] } }>(COMMONS_API, {
        action: "query",
        format: "json",
        formatversion: "2",
        list: "search",
        srnamespace: "6",
        srlimit: "5",
        srsearch: q,
      });
      for (const hit of j.query?.search ?? []) {
        const file = hit.title.replace(/^File:/, "");
        if (b.commons.some((c) => c.file === file) || !/\.(pdf|djvu|jpe?g|png|tiff?)$/i.test(file)) continue;
        const paged = /\.(pdf|djvu|tiff?)$/i.test(file);
        const big = await rendered(COMMONS_API, file, paged ? 1 : null, 960);
        const small = await rendered(COMMONS_API, file, paged ? 1 : null, 500);
        if (big.image && small.image) b.commons.push({ file, page: paged ? 1 : null, image: big.image, review: small.image, description: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}` });
      }
    }
  }
  writeFileSync(CANDIDATES, JSON.stringify(books, null, 1));
  const ws = books.filter((b) => b.wikisource.length).length;
  const gb = books.filter((b) => b.gutenberg.length).length;
  console.log(`candidates: ${books.length} books; Wikisource scans ${ws}, Gutenberg ${gb}, Commons searches with hits ${books.filter((b) => b.commons.length).length}`);
}

// ---------------------------------------------------------------- download

// Review copies, one request at a time: Wikimedia's thumbnails through
// thumb.wikimedia.org, Gutenberg's covers from its PGLAF mirror (Gutenberg
// asks for bulk access to go to mirrors).
async function download() {
  mkdirSync(IMG, { recursive: true });
  const books = JSON.parse(readFileSync(CANDIDATES, "utf8")) as CoverBook[];
  const get = async (url: string, file: string) => {
    if (existsSync(file)) return true;
    for (let attempt = 1; attempt <= 3; attempt++) {
      // Thumbnails through Wikimedia's thumbnail host; originals (small files
      // the API returns as they are) only exist on upload.wikimedia.org.
      const target = url.includes("/thumb/") ? url.replace("//upload.wikimedia.org/", "//thumb.wikimedia.org/") : url;
      const res = await fetch(target, { headers: { "User-Agent": USER_AGENT } }).catch(() => null);
      if (res?.ok && /^image\//.test(res.headers.get("content-type") ?? "")) {
        writeFileSync(file, Buffer.from(await res.arrayBuffer()));
        return true;
      }
      await sleep(3000 * attempt);
    }
    return false;
  };
  let done = 0;
  for (const b of books) {
    for (const w of b.wikisource) {
      if (!w.review) continue;
      await get(w.review, join(IMG, `ws-${safe(w.file)}.jpg`));
      await sleep(250);
    }
    for (const g of b.gutenberg) {
      await get(g.review, join(IMG, `pg-${g.id}.jpg`));
      if (g.full === null) {
        const head = await fetch(`https://gutenberg.pglaf.org/cache/epub/${g.id}/images/cover.jpg`, { method: "HEAD", headers: { "User-Agent": USER_AGENT } }).catch(() => null);
        g.full = head?.ok ? `https://www.gutenberg.org/cache/epub/${g.id}/images/cover.jpg` : "";
      }
      await sleep(400);
    }
    for (const c of b.commons) {
      await get(c.review, join(IMG, `cm-${safe(c.file)}.jpg`));
      await sleep(250);
    }
    if (++done % 50 === 0) console.log(`  ${done}/${books.length}`);
  }
  writeFileSync(CANDIDATES, JSON.stringify(books, null, 1));
  console.log(`review images: ${readdirSync(IMG).length}`);
}

export const safe = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, "_").slice(0, 120);

// ---------------------------------------------------------------- write

async function write() {
  const { DECISIONS } = await import("./covers/decisions");
  const books = JSON.parse(readFileSync(CANDIDATES, "utf8")) as CoverBook[];
  const bnNum = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  const deathClause = (b: CoverBook) =>
    b.authorDeathYear < 0 ? "লেখক প্রাচীন কালের" : `লেখক ${bnNum(b.authorDeathYear)} সালে মারা গেছেন`;
  const rows: unknown[] = [];
  const outcomes: { book: CoverBook; status: string; reason: string; source?: string }[] = [];
  for (const b of books) {
    const d = DECISIONS[b.key];
    if (!d) {
      outcomes.push({ book: b, status: "none", reason: b.wikisource.length || b.gutenberg.length || b.commons.length ? "not reviewed" : "no scan or cover found anywhere" });
      continue;
    }
    if (d.verdict === "reject") {
      outcomes.push({ book: b, status: "none", reason: d.reason });
      continue;
    }
    // The page that was reviewed: the scan's own cover page unless the
    // decision names another, rendered by Wikimedia at 960px.
    let url: string | null = null;
    let where = "";
    if (d.from === "wikisource") {
      const w = b.wikisource[0];
      const page = d.page ?? w.page;
      url = page === w.page ? w.image : (await rendered(WIKISOURCE_API, w.file, /\.(pdf|djvu)$/i.test(w.file) ? page : null, 960)).image;
      where = w.repo === "shared" ? "উইকিমিডিয়া কমন্সের" : "উইকিসংকলনের";
    } else if (d.from === "gutenberg") {
      // The producer's full-size scan when Gutenberg has one; the catalog's
      // cover otherwise (the image that was reviewed, at about 200px).
      const g = b.gutenberg[0];
      url = d.useMedium || !g.full ? g.medium : g.full;
      where = "প্রজেক্ট গুটেনবার্গের";
    } else {
      const c = b.commons.find((x) => x.file === d.file);
      const paged = /\.(pdf|djvu|tiff?)$/i.test(d.file ?? "");
      url = c && (!paged || (d.page ?? 1) === c.page) ? c.image : d.file ? (await rendered(COMMONS_API, d.file, paged ? d.page ?? 1 : null, 960)).image : null;
      where = "উইকিমিডিয়া কমন্সের";
    }
    if (!url) {
      outcomes.push({ book: b, status: "none", reason: "image URL not available" });
      continue;
    }
    // Wikimedia's thumbnails, written as upload.wikimedia.org addresses (the
    // server fetches them through Wikimedia's thumbnail host).
    url = url.replace("//thumb.wikimedia.org/", "//upload.wikimedia.org/");
    const edition = d.edition ? `${bnNum(d.edition)} সালের সংস্করণের` : "পুরোনো সংস্করণের";
    const part = d.kind === "title" ? "নামপত্র" : d.kind === "binding" ? "বাঁধাইয়ের প্রচ্ছদ" : "প্রচ্ছদ";
    const art = d.artist ? ` ছবিটি ${d.artist.name}-এর আঁকা; তিনি ${bnNum(d.artist.died)} সালে মারা গেছেন।` : "";
    const rightsBasis = `${edition} ${part}, ${where} স্ক্যান থেকে। ${deathClause(b)}; কপিরাইটের মেয়াদ শেষ।${art}`;
    const row = { match: { title: b.title, titleBangla: b.titleBangla, author: b.author }, cover: { url, rightsBasis } };
    const check = bookUpdateRowSchema.safeParse(row);
    if (!check.success) throw new Error(`${b.title}: ${check.error.issues.map((i) => i.message).join("; ")}`);
    rows.push(row);
    outcomes.push({ book: b, status: "cover", reason: `${d.from}: ${part}`, source: url });
  }

  for (const f of readdirSync("data").filter((f) => /^covers-import(-\d+)?\.json$/.test(f))) rmSync(join("data", f));
  const files: string[] = [];
  if (rows.length <= MAX_IMPORT_ROWS) {
    writeFileSync("data/covers-import.json", JSON.stringify(rows, null, 2) + "\n");
    files.push("data/covers-import.json");
  } else {
    for (let i = 0; i < rows.length; i += MAX_IMPORT_ROWS) {
      const f = `data/covers-import-${files.length + 1}.json`;
      writeFileSync(f, JSON.stringify(rows.slice(i, i + MAX_IMPORT_ROWS), null, 2) + "\n");
      files.push(f);
    }
  }
  writeReport(books, outcomes, files);
  console.log(`covers: ${rows.length} in ${files.join(", ")}; generated cover stays: ${outcomes.filter((o) => o.status === "none").length}`);
}

function writeReport(books: CoverBook[], outcomes: { book: CoverBook; status: string; reason: string; source?: string }[], files: string[]) {
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  const count = (xs: string[]) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const got = outcomes.filter((o) => o.status === "cover");
  const none = outcomes.filter((o) => o.status === "none");
  const L: string[] = [];
  L.push("# Real covers — review report", "");
  L.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/covers-prepare.ts\`. Import with ${files.map((f) => `\`${f}\``).join(", ")} on /admin/books.`, "");
  L.push("| | Books |", "|---|---|");
  L.push(`| Public-domain books considered | ${books.length} |`);
  L.push(`| Get a real cover | ${got.length} |`);
  L.push(`| Keep the generated cover | ${none.length} |`, "");
  L.push("## Covers, by kind", "", "| Kind | Books |", "|---|---|");
  for (const [k, v] of count(got.map((o) => o.reason))) L.push(`| ${cell(k)} | ${v} |`);
  L.push("", "## Why the others keep the generated cover", "", "| Reason | Books |", "|---|---|");
  for (const [k, v] of count(none.map((o) => o.reason))) L.push(`| ${cell(k)} | ${v} |`);
  L.push("", "## Every book", "", "| Book | Author | Outcome |", "|---|---|---|");
  for (const o of outcomes) L.push(`| ${cell(o.book.titleBangla || o.book.title)} | ${cell(o.book.author)} | ${o.status === "cover" ? `cover — ${cell(o.reason)}` : cell(o.reason)} |`);
  writeFileSync("data/covers-report.md", L.join("\n") + "\n");
}

const cmd = process.argv[2];
(cmd === "collect" ? collect() : cmd === "download" ? download() : cmd === "write" ? write() : Promise.reject(new Error("collect | download | write"))).catch((err) => {
  console.error(err);
  process.exit(1);
});
