// Stage 3: check on Wikisource itself that the work's main page is a complete
// text: it (or its chapter subpages) transcludes the scan, every scan it
// transcludes is fully proofread, and no transcluded page is unproofread.
import { mwQueryAll, postForm, WIKISOURCE_API } from "./http";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toLatinDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
const normFile = (f: string) => f.replace(/_/g, " ").replace(/\s+/g, " ").trim();

export type Verification = {
  ok: boolean;
  reason?: string;
  categories: string[]; // the main page's visible categories
  transcludedFiles: string[];
  pagesInScan: number;
  textPages: number; // proofread (3) or validated (4)
  validatedPages: number;
  transcludedTextPages: number;
  coverage: number; // share of the scan's text pages that the main page transcludes
  subpages: number;
};

// A <pages> tag, resolved later against the scan's real page numbers: a
// missing "to" means to the end of the scan, a missing "from" from page 1.
type Range = { file: string; from: number; to: number; include: number[]; exclude: number[] };

function expand(list: string): number[] {
  const out: number[] = [];
  for (const part of toLatinDigits(list).split(",").map((x) => x.trim()).filter(Boolean)) {
    const [a, b] = part.split("-").map(Number);
    if (Number.isNaN(a)) continue;
    const last = b === undefined || Number.isNaN(b) ? a : b;
    for (let i = a; i <= last; i++) out.push(i);
  }
  return out;
}

const PAGES_TAG = new RegExp(String.raw`<pages\b([^>]*?)/?>`, "gi");
const ATTR = new RegExp(String.raw`([a-z]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'/>]+))`, "gi");

// <pages index="File.pdf" from=3 to=40 include="1,5-7" exclude="12" />
export function parsePagesTags(wikitext: string): Range[] {
  const out: Range[] = [];
  for (const m of wikitext.matchAll(PAGES_TAG)) {
    const attrs: Record<string, string> = {};
    for (const a of m[1].matchAll(ATTR)) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? "";
    if (!attrs.index) continue;
    const num = (v?: string) => (v ? Number(toLatinDigits(v)) : NaN);
    const from = num(attrs.from);
    const to = num(attrs.to);
    const include = expand(attrs.include ?? "");
    const exclude = expand(attrs.exclude ?? "");
    const hasRange = !Number.isNaN(from) || !Number.isNaN(to);
    out.push({
      file: normFile(attrs.index),
      // Only include= given: just those pages. Nothing given: the whole scan.
      from: hasRange ? (Number.isNaN(from) ? 1 : from) : include.length ? 0 : 1,
      to: hasRange ? (Number.isNaN(to) ? Infinity : to) : include.length ? -1 : Infinity,
      include,
      exclude,
    });
  }
  return out;
}

function pagesOf(r: Range, scan: Iterable<number>): Set<number> {
  const out = new Set<number>(r.include);
  for (const n of scan) if (n >= r.from && n <= r.to) out.add(n);
  for (const n of r.exclude) out.delete(n);
  return out;
}

const qualityCache = new Map<string, Map<number, number | "missing">>();

// Page number -> quality (0 without text, 1 not proofread, 2 problematic,
// 3 proofread, 4 validated) for every page of a scan.
export async function scanQualities(file: string): Promise<Map<number, number | "missing">> {
  const cached = qualityCache.get(file);
  if (cached) return cached;
  const list = await postForm<{ query?: { proofreadpagesinindex?: { title: string }[] } }>(WIKISOURCE_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    list: "proofreadpagesinindex",
    prppiititle: `নির্ঘণ্ট:${file}`,
    prppiiprop: "title",
  });
  const titles = (list.query?.proofreadpagesinindex ?? []).map((x) => x.title);
  const out = new Map<number, number | "missing">();
  for (let i = 0; i < titles.length; i += 50) {
    const pages = await mwQueryAll(WIKISOURCE_API, { titles: titles.slice(i, i + 50).join("|"), prop: "proofread" });
    for (const p of pages) {
      const n = Number(toLatinDigits(String(p.title).split("/").pop() ?? ""));
      out.set(n, p.missing ? "missing" : ((p.proofread as { quality?: number } | undefined)?.quality ?? "missing"));
    }
  }
  qualityCache.set(file, out);
  return out;
}

type Rev = { slots: { main: { content: string } } }[] | undefined;
const contentOf = (p: Record<string, unknown>) => String((p.revisions as Rev)?.[0]?.slots.main.content ?? "");

export async function verifyWork(mainPage: string, ownFile: string, completeFiles: Set<string>): Promise<Verification> {
  const v: Verification = {
    ok: false,
    categories: [],
    transcludedFiles: [],
    pagesInScan: 0,
    textPages: 0,
    validatedPages: 0,
    transcludedTextPages: 0,
    coverage: 0,
    subpages: 0,
  };
  const [main] = await mwQueryAll(WIKISOURCE_API, {
    titles: mainPage,
    prop: "revisions|categories",
    rvprop: "content",
    rvslots: "main",
    cllimit: "max",
    clshow: "!hidden",
    redirects: "1",
  });
  if (!main || main.missing) return { ...v, reason: "the main Wikisource page doesn't exist" };
  const title = String(main.title);
  v.categories = ((main.categories as { title: string }[] | undefined) ?? []).map((c) => c.title.replace(/^বিষয়শ্রেণী:/, ""));
  const texts = [contentOf(main)];

  const subs = await mwQueryAll(WIKISOURCE_API, {
    generator: "allpages",
    gapnamespace: "0",
    gapprefix: `${title}/`,
    gaplimit: "50",
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
  });
  v.subpages = subs.length;
  for (const s of subs) texts.push(contentOf(s));

  const ranges = texts.flatMap(parsePagesTags);
  const files = [...new Set(ranges.map((r) => r.file))];
  v.transcludedFiles = files;
  const own = normFile(ownFile);
  if (!files.includes(own)) return { ...v, reason: "the main page doesn't transclude this scan" };
  const incomplete = files.filter((f) => !completeFiles.has(f));
  if (incomplete.length) return { ...v, reason: `it also transcludes a scan that isn't fully proofread (${incomplete.join(", ")})` };

  for (const f of files) {
    const q = await scanQualities(f);
    const transcluded = new Set<number>();
    for (const r of ranges.filter((x) => x.file === f)) for (const n of pagesOf(r, q.keys())) transcluded.add(n);
    for (const n of transcluded) {
      const quality = q.get(n);
      if (quality === undefined) continue; // beyond the end of the scan
      if (quality === "missing" || quality === 1 || quality === 2) {
        const state = quality === "missing" ? "not transcribed" : quality === 2 ? "marked problematic" : "not proofread";
        return { ...v, reason: `page ${n} of ${f} is ${state}` };
      }
    }
    if (f === own) {
      v.pagesInScan = q.size;
      const textPages = [...q].filter(([, x]) => x === 3 || x === 4).map(([n]) => n);
      v.textPages = textPages.length;
      v.validatedPages = [...q.values()].filter((x) => x === 4).length;
      v.transcludedTextPages = textPages.filter((n) => transcluded.has(n)).length;
      v.coverage = textPages.length ? v.transcludedTextPages / textPages.length : 0;
    }
  }
  // Front matter is often left out of the main text on purpose; anything
  // much below this means chapters are missing.
  if (v.coverage < 0.8) return { ...v, reason: `only ${Math.round(v.coverage * 100)}% of the scan's text pages appear on the main page` };
  return { ...v, ok: true };
}
