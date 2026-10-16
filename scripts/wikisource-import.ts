// Prepares a catalog import of complete, public-domain Bangla works on
// bn.wikisource.org. Nothing is written to any database: the output is files
// for a person to review and import through /admin/books.
//
//   npx tsx --env-file=.env scripts/wikisource-import.ts [--limit N]
//
// Writes
//   data/wikisource-import-2.json      rows for the admin import not already in
//                                      batch 1 (data/wikisource-import.json, which
//                                      is read but never rewritten): new books,
//                                      then links for catalog books; -3, -4 ...
//                                      past 500 rows
//   data/wikisource-batch1-corrections.json
//                                      update rows for batch 1 books already
//                                      imported: translator credits and
//                                      corrected rights notes
//   data/wikisource-unclassified.json  works with no confirmed form, for later
//                                      (only when there are any)
//   data/wikisource-excluded.json      everything left out, with the reason
//   data/wikisource-report.md          counts, category decisions, translators
//
// The rules, step by step:
//   1. Scans: every index on bn.wikisource in "১০০% মুদ্রণ সংশোধিত" or
//      "১০০% বৈধকৃত" -- no page left unproofread (scripts/wikisource/indexes.ts).
//   2. Wikidata: the scan's edition item, its work, authors, translators and
//      editors. Every one of them must have died in or before (this year - 61);
//      anonymous works, translations with no named translator, non-Bangla
//      texts and non-books are left out (scripts/wikisource/candidates.ts).
//   3. Wikisource: the main page must transclude the scan, every scan it
//      transcludes must be complete, no transcluded page may be unproofread,
//      and at least 80% of the scan's text pages must be on the main page
//      (scripts/wikisource/verify.ts).
//   4. One row per work (several scans of one main page are one book; several
//      editions of one work keep the best-proofread one), minus anything
//      already in our catalog, and minus posthumous works first published
//      after the cutoff year (protected for 60 years from publication).
//
// Then run scripts/wikisource-spot-check.ts for the live spot-check, and
// scripts/wikisource-translator-check.ts to re-check every translator live.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fetchCompleteIndexes } from "./wikisource/indexes";
import { buildCandidates, PD_CUTOFF, type Candidate, type Person } from "./wikisource/candidates";
import { verifyWork, type Verification } from "./wikisource/verify";
import { classify, EXCLUDED_BY_HAND, FORM_BY_HAND, formByKey, UNCLASSIFIED_NOTES, type Form } from "./wikisource/classify";
import { BANGLA_ORIGINAL, RETOLD_BY_AUTHOR } from "./wikisource/translators";
import { CONFIRMED_DEATHS, NO_SOURCE, NOT_CONFIRMED } from "./wikisource/death-years";
import { romanize } from "./wikisource/romanize";
import { describe } from "./wikisource/descriptions";
import { networkCalls } from "./wikisource/http";
import { normalizeForSearch } from "../src/lib/search";
import { bookImportRowSchema, bookUpdateRowSchema } from "../src/lib/book-schema";

type Row = {
  title: string;
  titleBangla: string;
  author: string;
  translator?: string; // who wrote the Bangla text of a translation
  category: string;
  description: string;
  language: "bn";
  publishYear: number | null;
  authorDeathYear: number;
  isPublicDomain: true;
  sources: { url: string; rightsBasis: string }[];
};

type Included = {
  c: Candidate;
  v: Verification;
  form: Form | null;
  row: Row;
  romanized: boolean;
  scans: string[];
};

type CatalogBook = { title: string; titleBangla: string | null; author: string; category: string };
type Linked = { c: Candidate; v: Verification; scans: string[]; row: Row; catalog: CatalogBook };

// Same limit as the admin import (src/actions/admin-books.ts).
const MAX_IMPORT_ROWS = 500;

// Import files already handed over; never rewritten (see "Batches" below).
const FROZEN_FILES = ["data/wikisource-import.json"];

// Batch 1 rights notes corrected after batch 1 was first handed over
// (data/wikisource-batch1-corrections.md): the corrections file carries
// them, in case the import went in before the correction.
const BATCH1_NOTES_CORRECTED = new Set([
  "https://bn.wikisource.org/wiki/কথামালা_(১৮৭৭)",
  "https://bn.wikisource.org/wiki/চিত্রে_জয়দেব_ও_গীতগোবিন্দ",
  "https://bn.wikisource.org/wiki/মেগাস্থেনীসের_ভারত-বিবরণ_(১৯৪৪)",
]);

// Field order for files a person reads: who and what first, then the rest.
const tidy = (r: Row): Row => ({
  title: r.title,
  titleBangla: r.titleBangla,
  author: r.author,
  ...(r.translator ? { translator: r.translator } : {}),
  category: r.category,
  description: r.description,
  language: r.language,
  publishYear: r.publishYear,
  authorDeathYear: r.authorDeathYear,
  isPublicDomain: r.isPublicDomain,
  sources: r.sources,
});

// Which category each form goes to, as decided on 2026-10-15: five new
// categories (created by migration 20261015085903) for plays, short stories,
// essays, travel writing and children's books; religion, science, language
// and letters fold into essays, and the songbook into poetry. Every other
// form keeps the category its rule gives.
const CATEGORY_FOR_FORM: Record<string, string> = {
  religion: "probondho",
  science: "probondho",
  education: "probondho",
  letters: "probondho",
  songs: "kobita",
};
const categoryFor = (form: Form | null): string | null => (form ? (CATEGORY_FOR_FORM[form.key] ?? form.category) : null);

const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
// Wikidata's Bangla label is sometimes a writer's legal name rather than the
// name readers know (and our catalog uses).
const KNOWN_AS: Record<string, string> = {
  Q3115772: "মানিক বন্দ্যোপাধ্যায়", // labelled প্রবোধকুমার বন্দ্যোপাধ্যায়
};
const nameOf = (p: Person) => KNOWN_AS[p.id] ?? p.nameBn ?? p.nameEn ?? p.id;

// First-publication years known for certain, for works whose Wikidata item
// has none and whose scan is a later reprint. Keyed like the import row.
const FIRST_PUBLISHED: Record<string, number> = {
  "চতুরঙ্গ|রবীন্দ্রনাথ ঠাকুর": 1916,
  "গল্পসল্প|রবীন্দ্রনাথ ঠাকুর": 1941,
  "ঘরোয়া|অবনীন্দ্রনাথ ঠাকুর": 1941,
};

// Wikisource main-page titles carry a disambiguator: "গোরা (রবীন্দ্রনাথ ঠাকুর)".
const cleanTitle = (t: string) => t.replace(/\s*\([^)]*\)\s*$/, "").trim();

// Loose identity for de-duplication: case, spacing, hyphens and punctuation
// don't make a different book.
const loose = (s: string) => normalizeForSearch(s).replace(/[\s\-–—_.,;:!?'"“”‘’()।]/g, "");
const keysOf = (b: { title?: string | null; titleBangla?: string | null; author: string }) =>
  [b.title, b.titleBangla].filter((t): t is string => !!t).map((t) => `${loose(b.author)}|${loose(t)}`);

// In the style of the library's existing notes: "লেখক ১৯৪১ সালে মারা গেছেন;
// কপিরাইটের মেয়াদ শেষ। উৎস: বাংলা উইকিসংকলন". Names appear only when more
// than one person is involved.
// "১৯৪১ সালে" for an exact year; Wikidata's own precision otherwise.
const when = (p: Person) => p.deathText ?? `${bnDigits(p.deathYear!)} সালে`;

function rightsBasis(c: Candidate): string {
  const everyone = [...c.authors, ...c.translators, ...c.editors];
  // Someone known only by era (death-years.ts): one clause per person, since
  // "মারা গেছেন" doesn't fit an era.
  if (everyone.some((p) => p.era)) {
    const clause = (role: string, p: Person) => (p.era ? `${role} ${nameOf(p)} ${p.era}` : `${role} ${nameOf(p)} ${when(p)} মারা গেছেন`);
    const parts = [
      ...c.authors.map((p) => clause(c.translators.length ? "মূল লেখক" : "লেখক", p)),
      ...c.translators.map((p) => clause("অনুবাদক", p)),
      ...c.editors.map((p) => clause("সম্পাদক", p)),
    ];
    return `${parts.join("; ")}; কপিরাইটের মেয়াদ শেষ। উৎস: বাংলা উইকিসংকলন`;
  }
  const solo = c.authors.length === 1 && c.translators.length === 0 && c.editors.length === 0;
  const parts = [
    ...c.authors.map((p) => `লেখক ${solo ? "" : `${nameOf(p)} `}${when(p)}`),
    ...c.translators.map((p) => `অনুবাদক ${nameOf(p)} ${when(p)}`),
    ...c.editors.map((p) => `সম্পাদক ${nameOf(p)} ${when(p)}`),
  ];
  const who = parts.length <= 2 ? parts.join(" ও ") : `${parts.slice(0, -1).join(", ")} ও ${parts[parts.length - 1]}`;
  return `${who} মারা গেছেন; কপিরাইটের মেয়াদ শেষ। উৎস: বাংলা উইকিসংকলন`;
}

// Every book already in the catalog, by loose key: the database's (the seed
// plus anything imported), then data/catalog-import.json for any that aren't
// there. Exact titles and author are kept, so a link-only row can name the
// book exactly as the catalog does.
async function existingCatalog(): Promise<Map<string, CatalogBook>> {
  const books = new Map<string, CatalogBook>();
  const add = (b: CatalogBook) => {
    for (const k of keysOf(b)) if (!books.has(k)) books.set(k, b);
  };
  let fromDb = 0;
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const rows = await prisma.book.findMany({ select: { title: true, titleBangla: true, author: true, category: { select: { slug: true } } } });
      fromDb = rows.length;
      for (const b of rows) add({ title: b.title, titleBangla: b.titleBangla, author: b.author, category: b.category.slug });
    } finally {
      await prisma.$disconnect();
    }
  }
  const file = JSON.parse(readFileSync("data/catalog-import.json", "utf8")) as CatalogBook[];
  for (const b of file) add({ title: b.title, titleBangla: b.titleBangla ?? null, author: b.author, category: b.category });
  console.log(`catalog to match against: ${fromDb} books in the database + ${file.length} rows in data/catalog-import.json`);
  return books;
}

// "?", "#" and "%" in a page title must be escaped, or "ভারত কোন্ পথে?" would
// link to a page called "ভারত কোন্ পথে" with an empty query string.
const wikisourceUrl = (page: string) =>
  `https://bn.wikisource.org/wiki/${page.replace(/ /g, "_").replace(/[?#%]/g, (ch) => encodeURIComponent(ch))}`;

function shuffleSeeded<T>(xs: T[], seed: number): T[] {
  const a = [...xs];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;

  const indexes = await fetchCompleteIndexes();
  const completeFiles = new Set(indexes.map((i) => i.file.replace(/_/g, " ").replace(/\s+/g, " ").trim()));
  const candidates = await buildCandidates(indexes);
  console.log(`complete scans: ${indexes.length}; passing Wikidata checks: ${candidates.filter((c) => !c.excluded).length}`);

  const excluded: { title: string; author: string; scan: string; wikisource: string | null; reason: string }[] = [];
  const exclude = (c: Candidate, reason: string) =>
    excluded.push({
      title: c.titleBn ?? (c.mainPage ? cleanTitle(c.mainPage) : c.index.file),
      author: c.authors.map(nameOf).join(" ও ") || "—",
      scan: c.index.file,
      wikisource: c.mainPage ? wikisourceUrl(c.mainPage) : null,
      reason,
    });
  for (const c of candidates) if (c.excluded) exclude(c, c.excluded);

  // Stage 3, once per main page: several scans (volumes) can share one.
  const byMain = new Map<string, Candidate[]>();
  for (const c of candidates.filter((x) => !x.excluded).slice(0, limit)) {
    byMain.set(c.mainPage!, [...(byMain.get(c.mainPage!) ?? []), c]);
  }
  const verified: { c: Candidate; v: Verification; scans: string[] }[] = [];
  let n = 0;
  for (const [main, group] of byMain) {
    n++;
    if (n % 25 === 0) console.log(`  verified ${n}/${byMain.size} main pages (network calls: ${networkCalls})`);
    const results = await Promise.all(group.map(async (c) => ({ c, v: await verifyWork(main, c.index.file, completeFiles) })));
    const good = results.filter((r) => r.v.ok);
    for (const r of results.filter((x) => !x.v.ok)) exclude(r.c, `Wikisource text incomplete: ${r.v.reason}`);
    if (good.length) verified.push({ c: good[0].c, v: good[0].v, scans: good.map((g) => g.c.index.file) });
  }

  // One row per work: the edition with the most validated pages, then the
  // older printing.
  const catalog = await existingCatalog();
  const yearOf = (c: Candidate) => c.editionYear ?? 9999;
  const byWork = new Map<string, { c: Candidate; v: Verification; scans: string[] }[]>();
  for (const x of verified) {
    const key = x.c.workId ?? `${loose(x.c.authors.map(nameOf).join())}|${loose(x.c.titleBn ?? x.c.mainPage!)}`;
    byWork.set(key, [...(byWork.get(key) ?? []), x]);
  }
  const included: Included[] = []; // new books
  const linked: Linked[] = []; // links for books already in the catalog
  const seenKeys = new Set<string>();
  for (const group of byWork.values()) {
    group.sort((a, b) => b.v.validatedPages / (b.v.textPages || 1) - a.v.validatedPages / (a.v.textPages || 1) || yearOf(a.c) - yearOf(b.c));
    const [best, ...others] = group;
    for (const o of others) exclude(o.c, `another edition of the same work (kept ${best.c.index.file})`);

    const c = best.c;
    // A translation's own title is its Bangla edition's (the Wikisource page),
    // not the original work's label, which is often just transliterated.
    const titleBangla = c.translation ? cleanTitle(c.mainPage!) : c.titleBn ?? cleanTitle(c.mainPage!);
    const romanized = !c.titleEn;
    const title = c.titleEn ?? romanize(titleBangla);
    const author = c.authors.map(nameOf).join(" ও ");
    const leftOut = EXCLUDED_BY_HAND[`${titleBangla}|${author}`];
    if (leftOut) {
      exclude(c, leftOut);
      continue;
    }

    // Bangladeshi law protects a work first published after its author's
    // death for 60 years from publication, so the death year alone doesn't
    // clear it. (A translation counts from its translator, and from its
    // edition: the original's date says nothing about the translation's.)
    const people = c.translation && c.translators.length ? c.translators : c.authors;
    const role = c.translation && c.translators.length ? "translator" : "author";
    const lastDeath = Math.max(...people.map((p) => p.deathYear!));
    const editionYears = group.map((g) => g.c.editionYear).filter((y): y is number => y !== null);
    const earliestEdition = editionYears.length ? Math.min(...editionYears) : null;
    const known = FIRST_PUBLISHED[`${titleBangla}|${author}`] ?? (c.translation ? null : c.publishYear);
    const firstPublished = known !== null && known !== undefined ? Math.min(known, earliestEdition ?? Infinity) : c.translation ? earliestEdition : null;
    if (firstPublished !== null && firstPublished > PD_CUTOFF && firstPublished > lastDeath) {
      exclude(c, `first published in ${firstPublished}, after the death of its ${role} (${lastDeath}): a posthumous work is protected for 60 years from publication`);
      continue;
    }
    // No first-publication date anywhere, and the only date is a reprint
    // printed after the cutoff and the death: it may be a posthumous first
    // edition, so leave it out until someone checks.
    if (firstPublished === null && earliestEdition !== null && earliestEdition > PD_CUTOFF && earliestEdition > lastDeath) {
      exclude(c, `first publication date unknown, and the scanned edition was printed in ${earliestEdition}, after the death of its ${role} (${lastDeath}): check that it was published in their lifetime (a posthumous work is protected for 60 years from publication)`);
      continue;
    }

    const byHand = FORM_BY_HAND[`${titleBangla}|${author}`];
    const form = byHand ? formByKey(byHand) : classify([...c.index.categories, ...best.v.categories], c.wikidataTypes);
    const base = {
      ...(c.translators.length ? { translator: c.translators.map(nameOf).join(" ও ") } : {}),
      description: describe({ titleBangla, authors: c.authors.map(nameOf), translators: c.translators.map(nameOf), form }),
      language: "bn" as const,
      publishYear: c.publishYear,
      authorDeathYear: Math.max(...c.authors.map((a) => a.deathYear!)),
      isPublicDomain: true as const,
      sources: [{ url: wikisourceUrl(c.mainPage!), rightsBasis: rightsBasis(c) }],
    };

    // Already in the catalog: the row carries the catalog book's exact title,
    // Bangla title and author, so the admin import (which matches exactly,
    // ignoring only case and spacing) finds that book and adds the link to it
    // rather than creating a second copy.
    const keys = keysOf({ title, titleBangla, author });
    const hit = keys.map((k) => catalog.get(k)).find((b) => b !== undefined);
    if (hit) {
      linked.push({ c, v: best.v, scans: best.scans, catalog: hit, row: { ...base, title: hit.title, titleBangla: hit.titleBangla ?? titleBangla, author: hit.author, category: hit.category } });
      continue;
    }
    if (keys.some((k) => seenKeys.has(k))) {
      exclude(c, "same title and author as another work in this list");
      continue;
    }
    for (const k of keys) seenKeys.add(k);

    included.push({ c, v: best.v, form, romanized, scans: best.scans, row: { ...base, title, titleBangla, author, category: categoryFor(form) ?? "" } });
  }

  // Every row must pass the admin import's own validation, so the file can't
  // fail on upload. (Unclassified rows are checked with a stand-in category.)
  for (const x of [...included, ...linked]) {
    const check = bookImportRowSchema.safeParse({ ...x.row, category: x.row.category || "unclassified" });
    if (!check.success) throw new Error(`row "${x.row.titleBangla}" fails the import schema: ${check.error.issues.map((i) => i.message).join("; ")}`);
    // ...and every link must lead to exactly the page that was verified.
    const link = new URL(x.row.sources[0].url);
    if (link.search || link.hash || decodeURIComponent(link.pathname) !== `/wiki/${x.c.mainPage!.replace(/ /g, "_")}`) {
      throw new Error(`link for "${x.row.titleBangla}" doesn't lead to ${x.c.mainPage}: ${x.row.sources[0].url}`);
    }
  }

  const ready = included.filter((x) => x.row.category);
  const unclassified = included.filter((x) => !x.row.category);
  const sortRows = <T extends { row: Row }>(xs: T[]) =>
    [...xs].sort((a, b) => a.row.author.localeCompare(b.row.author, "bn") || a.row.titleBangla.localeCompare(b.row.titleBangla, "bn"));
  const urlOf = (x: { row: Row }) => x.row.sources[0].url;

  // Batches. A file already handed over for import is frozen: it is read,
  // never rewritten, and only rows not in it go into the next file. (New
  // books first, then rows that only add a link to a catalog book.)
  //
  // The one exception is a frozen row's rights note: if the wording rules
  // have become more careful since (an approximate date that read as exact),
  // the note is corrected in place and the change listed in the report.
  const current = new Map([...ready, ...linked].map((x) => [urlOf(x), x.row]));
  const noteChanges: { url: string; title: string; before: string; after: string }[] = [];
  const frozenRows: Row[] = [];
  for (const f of FROZEN_FILES.filter((f) => existsSync(f))) {
    const rows = JSON.parse(readFileSync(f, "utf8")) as Row[];
    let changed = false;
    for (const r of rows) {
      const now = current.get(r.sources[0].url);
      if (now && now.sources[0].rightsBasis !== r.sources[0].rightsBasis) {
        noteChanges.push({ url: r.sources[0].url, title: r.titleBangla, before: r.sources[0].rightsBasis, after: now.sources[0].rightsBasis });
        r.sources[0].rightsBasis = now.sources[0].rightsBasis;
        changed = true;
      }
    }
    if (changed) writeFileSync(f, JSON.stringify(rows, null, 2) + "\n");
    frozenRows.push(...rows);
  }
  const frozenUrls = new Set(frozenRows.map((r) => r.sources[0].url));
  const nowUrls = new Set([...ready, ...linked].map(urlOf));
  const noLongerPassing = frozenRows.filter((r) => !nowUrls.has(r.sources[0].url));
  const freshReady = sortRows(ready.filter((x) => !frozenUrls.has(urlOf(x))));
  const freshLinked = sortRows(linked.filter((x) => !frozenUrls.has(urlOf(x))));
  const fresh: (Included | Linked)[] = [...freshReady, ...freshLinked];

  for (const f of readdirSync("data").filter((f) => /^wikisource-(import-\d+|pending)\.json$/.test(f))) rmSync(`data/${f}`);
  const chunks: Row[][] = [];
  for (let i = 0; i < fresh.length; i += MAX_IMPORT_ROWS) chunks.push(fresh.slice(i, i + MAX_IMPORT_ROWS).map((x) => tidy(x.row)));
  const firstNew = FROZEN_FILES.length + 1;
  const importFiles = chunks.map((_, i) => `data/wikisource-import-${firstNew + i}.json`);
  chunks.forEach((rows, i) => writeFileSync(importFiles[i], JSON.stringify(rows, null, 2) + "\n"));
  if (unclassified.length) {
    writeFileSync(
      "data/wikisource-unclassified.json",
      JSON.stringify(
        sortRows(unclassified).map((x) => ({ ...tidy(x.row), category: null, note: UNCLASSIFIED_NOTES[`${x.row.titleBangla}|${x.row.author}`] ?? null })),
        null,
        2
      ) + "\n"
    );
  } else if (existsSync("data/wikisource-unclassified.json")) rmSync("data/wikisource-unclassified.json");

  // ---- translators: who wrote the Bangla text ----
  // Every work whose original is in another language or older than Bangla
  // prose: the translator (or the Bangla writer credited as author, for a
  // retelling) must be named and must pass the death-year rule too.
  type Writer = { id: string; name: string; role: string; deathYear: number | null; when: string };
  type TranslatorCheck = { batch: string; key: string; row: Row; original: string; writers: Writer[]; ok: boolean; note: string };
  const writer = (p: Person, role: string): Writer => ({ id: p.id, name: nameOf(p), role, deathYear: p.deathYear, when: p.era ?? p.deathText ?? String(p.deathYear) });
  const passes = (ws: Writer[]) => ws.length > 0 && ws.every((w) => w.deathYear !== null && w.deathYear <= PD_CUTOFF);
  const originalOf = (c: Candidate) =>
    c.authors.map((p) => `${nameOf(p)} (${p.era ?? p.deathText ?? p.deathYear})`).join(", ");
  const checks: TranslatorCheck[] = [];
  for (const x of [...ready, ...linked, ...unclassified]) {
    const key = `${x.row.titleBangla}|${x.row.author}`;
    const batch = frozenUrls.has(urlOf(x)) ? "1" : "2";
    const ancient = x.c.authors.some((p) => p.deathYear !== null && p.deathYear < 1800);
    if (x.c.translation || x.c.translators.length) {
      const writers = x.c.translators.map((p) => writer(p, "translator"));
      checks.push({ batch, key, row: x.row, original: originalOf(x.c), writers, ok: passes(writers), note: writers.length ? "translator named on Wikidata" : "no translator named" });
    } else if (RETOLD_BY_AUTHOR[key]) {
      const writers = x.c.authors.map((p) => writer(p, "Bangla writer, credited as author"));
      checks.push({ batch, key, row: x.row, original: RETOLD_BY_AUTHOR[key], writers, ok: passes(writers), note: "retold or translated by the credited author" });
    } else if (ancient) {
      const writers = x.c.authors.map((p) => writer(p, "author"));
      const known = BANGLA_ORIGINAL[key];
      checks.push({ batch, key, row: x.row, original: originalOf(x.c), writers, ok: Boolean(known) && passes(writers), note: known ?? "author died before 1800 and no translator is named: who wrote the Bangla text is unknown" });
    }
  }
  const batch1Failures = checks.filter((k) => k.batch === "1" && !k.ok);
  writeFileSync(
    "data/.wikisource-cache/translator-check.json",
    JSON.stringify(checks.map((k) => ({ batch: k.batch, title: k.row.titleBangla, url: k.row.sources[0].url, original: k.original, writers: k.writers })), null, 2)
  );

  // ---- batch 1 corrections: update rows for books already imported ----
  // A translator credit for every translation, and the rights note as it
  // should read now (the import shows a note change only where it differs
  // from what's stored). Matched by batch 1's own title, Bangla title and
  // author -- what the import stored.
  type UpdateRow = { match: { title: string; titleBangla: string; author: string }; set?: { translator: string }; sources: { url: string; rightsBasis: string }[] };
  const noteChangedNow = new Set(noteChanges.map((n) => n.url));
  const corrections: UpdateRow[] = [];
  for (const r of frozenRows) {
    const url = r.sources[0].url;
    const now = current.get(url);
    if (!now) continue;
    const noteFixed = BATCH1_NOTES_CORRECTED.has(url) || noteChangedNow.has(url);
    if (!now.translator && !noteFixed) continue;
    corrections.push({
      match: { title: r.title, titleBangla: r.titleBangla, author: r.author },
      ...(now.translator ? { set: { translator: now.translator } } : {}),
      sources: [{ url, rightsBasis: now.sources[0].rightsBasis }],
    });
  }
  for (const u of corrections) {
    const check = bookUpdateRowSchema.safeParse(u);
    if (!check.success) throw new Error(`correction for "${u.match.titleBangla}" fails the import schema: ${check.error.issues.map((i) => i.message).join("; ")}`);
  }
  if (corrections.length > MAX_IMPORT_ROWS) throw new Error(`${corrections.length} corrections: split the file`);
  writeFileSync("data/wikisource-batch1-corrections.json", JSON.stringify(corrections, null, 2) + "\n");
  excluded.sort((a, b) => a.reason.localeCompare(b.reason) || a.author.localeCompare(b.author, "bn"));
  writeFileSync("data/wikisource-excluded.json", JSON.stringify(excluded, null, 2) + "\n");

  // ---- the report ----
  const count = <T,>(xs: T[], key: (x: T) => string) => {
    const m = new Map<string, number>();
    for (const x of xs) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "bn"));
  };
  const reasonKey = (r: string) =>
    r
      .replace(/\(.*\)/, "")
      .replace(/\d{4}/g, "YYYY")
      .replace(/page \d+ of .+ is/, "a transcluded page is")
      .replace(/only \d+%/, "under 80%")
      .trim();
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  const fileList = importFiles.map((f) => `\`${f}\``).join(", ") || "(none)";
  const isFormByHand = (x: Included) => Boolean(FORM_BY_HAND[`${x.row.titleBangla}|${x.row.author}`]);
  const viaResearch = (x: { c: Candidate }) => [...x.c.authors, ...x.c.translators, ...x.c.editors].some((p) => CONFIRMED_DEATHS[p.id] && p.deathYear === CONFIRMED_DEATHS[p.id].year);
  const sample = shuffleSeeded(fresh, 20261016).slice(0, 20);
  const lines: string[] = [];
  const L = (s = "") => lines.push(s);
  L("# Bangla Wikisource import — review report");
  L();
  L(`Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/wikisource-import.ts\`. Public-domain cutoff: the author (and any translator or editor) died in **${PD_CUTOFF} or earlier**.`);
  L();
  L("## Totals");
  L();
  L(`| | Works |`);
  L(`|---|---|`);
  L(`| Fully proofread scans on bn.wikisource (start) | ${indexes.length} |`);
  L(`| Batch 1, already prepared (${FROZEN_FILES.map((f) => `\`${f}\``).join(", ")}, unchanged) | ${frozenRows.length} |`);
  L(`| Batch 2, new books (${fileList}) | ${freshReady.length} |`);
  L(`| Batch 2, links for books already in the catalog (same file) | ${freshLinked.length} |`);
  L(`| Batch 1 corrections: translator credits and rights notes (\`data/wikisource-batch1-corrections.json\`, update rows) | ${corrections.length} |`);
  L(`| Not imported yet: no confirmed category (\`data/wikisource-unclassified.json\`) | ${unclassified.length} |`);
  L(`| Left out, with reasons (\`data/wikisource-excluded.json\`) | ${excluded.length} |`);
  L();
  if (noLongerPassing.length) {
    L(`**Batch 1 rows that no longer pass:** ${noLongerPassing.length} — ${noLongerPassing.map((r) => r.titleBangla).join(", ")}. Remove them from batch 1 before importing it.`);
  } else {
    L("Every batch 1 row still passes every check.");
  }
  L();
  L(`**Batch 1 corrections.** \`data/wikisource-batch1-corrections.json\` has ${corrections.length} update rows for batch 1 books already imported: a translator credit for each of the ${corrections.filter((u) => u.set?.translator).length} translations, and the rights note each link should carry — including the three notes corrected after batch 1 was handed over (\`data/wikisource-batch1-corrections.md\`). Upload it on /admin/books like any import: the preview lists every book it changes under “আগের বইয়ে হালনাগাদ হবে”, and a note that is already right shows no change.`);
  L();
  if (noteChanges.length) {
    L(`**Batch 1 rights notes corrected in this run (${noteChanges.length}).** Only the note changed; the corrections file carries it.`);
    L();
    for (const n of noteChanges) L(`- ${n.title}: “${n.before}” → “${n.after}”`);
    L();
  }
  L(`**Importing.** Batch 1 is \`data/wikisource-import.json\` as before. Batch 2 is ${fileList}: ${freshReady.filter((x) => viaResearch(x)).length} works whose author's death year was confirmed from another source (below), and ${freshReady.filter((x) => !viaResearch(x) && isFormByHand(x as Included)).length} works whose category was settled by reading the text. Upload each on /admin/books.`);
  L();
  L("**Rules beyond the death year.** A work first published after its author's death (or a translation after its translator's) is protected in Bangladesh for 60 years from publication, so such a work first printed after " + PD_CUTOFF + " is excluded even when the author died earlier. Wikidata labels Manik Bandopadhyay by his legal name, প্রবোধকুমার বন্দ্যোপাধ্যায়; the import uses মানিক বন্দ্যোপাধ্যায়. A translation's Bangla title is taken from its Wikisource page, not from the original work's label.");
  L();
  const rowByKey = (key: string) => [...ready, ...linked].find((x) => `${x.row.titleBangla}|${x.row.author}` === key);
  const myth = ready.filter((x) => x.row.category === "puran-lokkotha");
  const kumudini = [...ready, ...linked].find((x) => x.c.authors.some((p) => p.id === "Q141100605"));
  L("## Decisions applied (2026-10-16)");
  L();
  L(`1. **কুমুদিনী বসু (সাহিত্য-চিন্তা): included.** Both Wikipedias put her death in 1942–43; the year used is 1943. Rights note: “${kumudini?.row.sources[0].rightsBasis ?? "(not found)"}”`);
  L(`2. **পুরাণ ও লোককথা** (\`puran-lokkotha\`, migration 20261015203820): ${myth.length} works — ${myth.map((x) => x.row.titleBangla).join(", ")}.`);
  L(`3. **পথে-বিপথে: ${rowByKey("পথে-বিপথে|অবনীন্দ্রনাথ ঠাকুর")?.row.category ?? "(not found)"}.** Of its 16 pieces, 12 are first-person stories on the Ganges ferry with the friend অবিন (মোহিনী, অস্থি, গুরুজী, টুপি, দোশালা, মাতু, শেমুষী, ইন্দু, অরোরা, পর্-ঈ-তাউস্, ছাই-ভস্ম, লুকি-বিদ্যে); 4 are travel sketches (গমনাগমন, নিষ্ক্রমণ, আরোহণ, বিচরণ).`);
  L("4. **শরৎ-সাহিত্য-সংগ্রহ: left out** (in `data/wikisource-excluded.json`).");
  L();
  L("## Translators: who wrote the Bangla text");
  L();
  L(`Every prepared work whose original is in another language or older than Bangla prose (${checks.length}): the person who wrote the Bangla text, and their death year, which must pass the same rule (${PD_CUTOFF} or earlier). A translator is credited on the book page (\`translator\`); for a retelling that Wikisource credits to the Bangla writer as author (রাজশেখর বসু's মহাভারত), that writer is the author shown, so there is no separate translator line. Re-checked live on Wikidata in \`data/wikisource-translator-check.md\` (\`scripts/wikisource-translator-check.ts\`).`);
  L();
  L(batch1Failures.length ? `**Batch 1 books that fail this check (${batch1Failures.length}):** ${batch1Failures.map((k) => `${k.row.titleBangla} (${k.note})`).join("; ")}.` : "**Every batch 1 book passes this check.** None has an unnamed translator or one who died after the cutoff.");
  L();
  L("| Batch | Work | Original | Bangla text by | Died | Passes |");
  L("|---|---|---|---|---|---|");
  for (const k of [...checks].sort((a, b) => a.batch.localeCompare(b.batch) || a.row.titleBangla.localeCompare(b.row.titleBangla, "bn"))) {
    const by = k.writers.map((w) => `${w.name} (${w.role})`).join(", ") || "—";
    const died = k.writers.map((w) => w.when).join(", ") || "—";
    L(`| ${k.batch} | ${cell(k.row.titleBangla)} | ${cell(k.original)} | ${cell(by)} | ${cell(died)} | ${k.ok ? "yes" : `**no** — ${cell(k.note)}`} |`);
  }
  L();
  L("## Batch 2");
  L();
  L("| Work | Author | Category | Why it's new |");
  L("|---|---|---|---|");
  for (const x of fresh) {
    const why = viaResearch(x) ? "death year confirmed (see below)" : isFormByHand(x as Included) ? "category settled by reading the text" : "new";
    L(`| ${cell(x.row.titleBangla)} | ${cell(x.row.author)} | \`${x.row.category}\` | ${why} |`);
  }
  L();
  L(`Rights notes for the era-dated authors read, for example: “${fresh.find((x) => viaResearch(x))?.row.sources[0].rightsBasis ?? ""}”`);
  L();
  L("## Authors without a Wikidata death year (researched 2026-10-16)");
  L();
  L("Each was looked up on Wikidata (again, live), the Bangla and English Wikipedia (article linked from Wikidata, then a search by name), and Banglapedia. A work is included only when a source confirms the year and the year passes the rule. Where a source gives only an era, the year used is the latest it allows.");
  L();
  L("| Author | Works | Decision | Source or reason |");
  L("|---|---|---|---|");
  const researched = new Map<string, { p: Person; works: string[] }>();
  for (const c of candidates)
    for (const p of c.authors)
      if (p.deathYear === null || (CONFIRMED_DEATHS[p.id] && p.deathYear === CONFIRMED_DEATHS[p.id].year)) {
        const e = researched.get(p.id) ?? { p, works: [] };
        e.works.push(c.titleBn ?? cleanTitle(c.mainPage ?? c.index.file));
        researched.set(p.id, e);
      }
  for (const { p, works } of [...researched.values()].sort((a, b) => Number(!CONFIRMED_DEATHS[a.p.id]) - Number(!CONFIRMED_DEATHS[b.p.id]) || nameOf(a.p).localeCompare(nameOf(b.p), "bn"))) {
    const found = CONFIRMED_DEATHS[p.id];
    const decision = found ? `**confirmed** — ${found.era ?? found.year} (year used: ${found.year})` : "left out";
    const why = found ? found.sources.map((s) => `${s.url} — “${s.says}”`).join("; ") : NOT_CONFIRMED[p.id] ?? NO_SOURCE;
    L(`| ${cell(nameOf(p))} | ${cell(works.join(", "))} | ${decision} | ${cell(why)} |`);
  }
  L();
  L("## Not imported yet: no confirmed category");
  L();
  if (unclassified.length) {
    L("They are in `data/wikisource-unclassified.json` with `category: null` and the note below.");
    L();
    for (const x of sortRows(unclassified)) L(`- ${x.row.titleBangla} — ${x.row.author}: ${UNCLASSIFIED_NOTES[`${x.row.titleBangla}|${x.row.author}`] ?? "form not found"} (${x.row.sources[0].url})`);
  } else {
    L("None: every work now has a category or was left out by decision.");
  }
  L();
  L("## All prepared books by category (batches 1 and 2)");
  L();
  L("| Category | Works |");
  L("|---|---|");
  for (const [k, v] of count(ready, (x) => x.row.category)) L(`| \`${k}\` | ${v} |`);
  L();
  L("## Per author (batches 1 and 2)");
  L();
  L("| Author | Died | New books | Links for catalog books | Unclassified |");
  L("|---|---|---|---|---|");
  for (const [a] of count([...included, ...linked], (x) => x.row.author)) {
    const d = [...included, ...linked].find((x) => x.row.author === a)!.row.authorDeathYear;
    const n = (xs: { row: Row }[]) => xs.filter((x) => x.row.author === a).length;
    L(`| ${a} | ${d} | ${n(ready)} | ${n(linked)} | ${n(unclassified)} |`);
  }
  L();
  L("## Excluded, by reason");
  L();
  L("| Reason | Works |");
  L("|---|---|");
  for (const [r, v] of count(excluded, (x) => reasonKey(x.reason))) L(`| ${r} | ${v} |`);
  L();
  L("Every excluded scan, with its exact reason, is listed at the end and in `data/wikisource-excluded.json`.");
  L();
  L("## Batch 2 titles romanised by the script (please check)");
  L();
  for (const x of freshReady.filter((i) => i.romanized)) L(`- ${x.row.titleBangla} → ${x.row.title}`);
  L();
  L("## Spot-checks");
  L();
  L("Live re-checks of a random sample, not from the import's cache: batch 1 in `data/wikisource-spot-check-1.md`, batch 2 in `data/wikisource-spot-check-2.md` (`scripts/wikisource-spot-check.ts 2`).");
  L();
  L("## Every excluded scan");
  L();
  L("| Work | Author | Scan | Reason |");
  L("|---|---|---|---|");
  for (const x of excluded) L(`| ${cell(x.title)} | ${cell(x.author)} | ${cell(x.scan)} | ${cell(x.reason)} |`);
  writeFileSync("data/wikisource-report.md", lines.join("\n") + "\n");
  writeFileSync(
    `data/.wikisource-cache/spot-check-sample-${firstNew}.json`,
    JSON.stringify(sample.map((x) => ({ row: x.row, authors: x.c.authors, translators: x.c.translators, editors: x.c.editors, scans: x.scans, mainPage: x.c.mainPage, v: x.v })), null, 2)
  );

  console.log(
    `\nbatch ${firstNew}: ${freshReady.length} new books + ${freshLinked.length} links in ${importFiles.join(", ") || "(none)"}; batch 1 rows no longer passing: ${noLongerPassing.length}; unclassified ${unclassified.length}, excluded ${excluded.length}; network calls: ${networkCalls}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
