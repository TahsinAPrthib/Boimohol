// Prepares a catalog import of complete, public-domain Bangla works on
// bn.wikisource.org. Nothing is written to any database: the output is files
// for a person to review and import through /admin/books.
//
//   npx tsx --env-file=.env scripts/wikisource-import.ts [--limit N]
//
// Writes
//   data/wikisource-import.json        rows for the six existing categories
//   data/wikisource-pending.json       rows whose form needs a new category
//   data/wikisource-excluded.json      everything left out, with the reason
//   data/wikisource-report.md          counts, proposed categories, spot-check
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
// Then run scripts/wikisource-spot-check.ts for the live spot-check.
import { readFileSync, writeFileSync } from "node:fs";
import { fetchCompleteIndexes } from "./wikisource/indexes";
import { buildCandidates, PD_CUTOFF, type Candidate, type Person } from "./wikisource/candidates";
import { verifyWork, type Verification } from "./wikisource/verify";
import { classify, FORM_BY_HAND, formByKey, PROPOSED_FORMS, type Form } from "./wikisource/classify";
import { romanize } from "./wikisource/romanize";
import { describe, KNOWN } from "./wikisource/descriptions";
import { networkCalls } from "./wikisource/http";
import { normalizeForSearch } from "../src/lib/search";
import { bookImportRowSchema } from "../src/lib/book-schema";

type Row = {
  title: string;
  titleBangla: string;
  author: string;
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
function rightsBasis(c: Candidate): string {
  const solo = c.authors.length === 1 && c.translators.length === 0 && c.editors.length === 0;
  const parts = [
    ...c.authors.map((p) => `লেখক ${solo ? "" : `${nameOf(p)} `}${bnDigits(p.deathYear!)} সালে`),
    ...c.translators.map((p) => `অনুবাদক ${nameOf(p)} ${bnDigits(p.deathYear!)} সালে`),
    ...c.editors.map((p) => `সম্পাদক ${nameOf(p)} ${bnDigits(p.deathYear!)} সালে`),
  ];
  const who = parts.length <= 2 ? parts.join(" ও ") : `${parts.slice(0, -1).join(", ")} ও ${parts[parts.length - 1]}`;
  return `${who} মারা গেছেন; কপিরাইটের মেয়াদ শেষ। উৎস: বাংলা উইকিসংকলন`;
}

async function existingCatalog(): Promise<Set<string>> {
  const keys = new Set<string>();
  const file = JSON.parse(readFileSync("data/catalog-import.json", "utf8")) as { title: string; titleBangla?: string; author: string }[];
  for (const b of file) for (const k of keysOf(b)) keys.add(k);
  let fromDb = 0;
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const books = await prisma.book.findMany({ select: { title: true, titleBangla: true, author: true } });
      fromDb = books.length;
      for (const b of books) for (const k of keysOf(b)) keys.add(k);
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log(`catalog to de-duplicate against: ${file.length} rows in data/catalog-import.json + ${fromDb} books in the database`);
  return keys;
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
  const catalogKeys = await existingCatalog();
  const yearOf = (c: Candidate) => c.editionYear ?? 9999;
  const byWork = new Map<string, { c: Candidate; v: Verification; scans: string[] }[]>();
  for (const x of verified) {
    const key = x.c.workId ?? `${loose(x.c.authors.map(nameOf).join())}|${loose(x.c.titleBn ?? x.c.mainPage!)}`;
    byWork.set(key, [...(byWork.get(key) ?? []), x]);
  }
  const included: Included[] = [];
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
    const keys = keysOf({ title, titleBangla, author });
    if (keys.some((k) => catalogKeys.has(k))) {
      exclude(c, "already in our catalog (add this Wikisource link to the existing book instead)");
      continue;
    }
    if (keys.some((k) => seenKeys.has(k))) {
      exclude(c, "same title and author as another work in this list");
      continue;
    }
    for (const k of keys) seenKeys.add(k);

    const byHand = FORM_BY_HAND[`${titleBangla}|${author}`];
    const form = byHand ? formByKey(byHand) : classify([...c.index.categories, ...best.v.categories], c.wikidataTypes);
    const url = wikisourceUrl(c.mainPage!);
    included.push({
      c,
      v: best.v,
      form,
      romanized,
      scans: best.scans,
      row: {
        title,
        titleBangla,
        author,
        category: form?.category ?? "",
        description: describe({ titleBangla, authors: c.authors.map(nameOf), translators: c.translators.map(nameOf), form }),
        language: "bn",
        publishYear: c.publishYear,
        authorDeathYear: Math.max(...c.authors.map((a) => a.deathYear!)),
        isPublicDomain: true,
        sources: [{ url, rightsBasis: rightsBasis(c) }],
      },
    });
  }

  // Every row must pass the admin import's own validation, so the file can't
  // fail on upload. (Pending rows are checked with a stand-in category.)
  for (const x of included) {
    const check = bookImportRowSchema.safeParse({ ...x.row, category: x.row.category || "pending" });
    if (!check.success) throw new Error(`row "${x.row.titleBangla}" fails the import schema: ${check.error.issues.map((i) => i.message).join("; ")}`);
    // ...and every link must lead to exactly the page that was verified.
    const link = new URL(x.row.sources[0].url);
    if (link.search || link.hash || decodeURIComponent(link.pathname) !== `/wiki/${x.c.mainPage!.replace(/ /g, "_")}`) {
      throw new Error(`link for "${x.row.titleBangla}" doesn't lead to ${x.c.mainPage}: ${x.row.sources[0].url}`);
    }
  }

  const ready = included.filter((x) => x.form && !x.form.proposed);
  const pending = included.filter((x) => !x.form || x.form.proposed);
  const sortRows = (xs: Included[]) => [...xs].sort((a, b) => a.row.author.localeCompare(b.row.author, "bn") || a.row.titleBangla.localeCompare(b.row.titleBangla, "bn"));
  writeFileSync("data/wikisource-import.json", JSON.stringify(sortRows(ready).map((x) => x.row), null, 2) + "\n");
  writeFileSync(
    "data/wikisource-pending.json",
    JSON.stringify(
      sortRows(pending).map((x) => ({ ...x.row, category: x.form?.category ?? null, proposedCategory: x.form?.proposed?.nameBangla ?? "(form unknown — choose a category)" })),
      null,
      2
    ) + "\n"
  );
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
  const sample = shuffleSeeded(included, 20261015).slice(0, 20);
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
  L(`| Ready to import now (\`data/wikisource-import.json\`) | ${ready.length} |`);
  L(`| Need a new category first (\`data/wikisource-pending.json\`) | ${pending.length} |`);
  L(`| Left out, with reasons (\`data/wikisource-excluded.json\`) | ${excluded.length} |`);
  L();
  const described = included.filter((x) => KNOWN[`${x.row.titleBangla}|${nameOf(x.c.authors[0])}`]);
  L(`**Descriptions.** ${described.length} works that are well known got an original one-sentence description (written in \`scripts/wikisource/descriptions.ts\`; no plot detail beyond what any summary says). The other ${included.length - described.length} use a neutral line: form and author, e.g. “${included.find((x) => !described.includes(x))?.row.description ?? ""}”`);
  L();
  L("**Rules beyond the death year.** A work first published after its author's death (or a translation after its translator's) is protected in Bangladesh for 60 years from publication, so such a work first printed after " + PD_CUTOFF + " is excluded even when the author died earlier. Wikidata labels Manik Bandopadhyay by his legal name, প্রবোধকুমার বন্দ্যোপাধ্যায়; the import uses মানিক বন্দ্যোপাধ্যায়. A translation's Bangla title is taken from its Wikisource page, not from the original work's label.");
  L();
  L("## Ready to import, by category");
  L();
  L("| Category | Works |");
  L("|---|---|");
  for (const [k, v] of count(ready, (x) => x.row.category)) L(`| \`${k}\` | ${v} |`);
  L();
  L("## Proposed new categories (not imported until you create them)");
  L();
  L(`A work's form comes from Wikisource's own categories, else Wikidata's type. For ${included.filter((x) => FORM_BY_HAND[`${x.row.titleBangla}|${x.row.author}`]).length} works whose form those sources don't give (or get wrong) it was set by hand, only where certain: they're listed in \`FORM_BY_HAND\` in \`scripts/wikisource/classify.ts\`. Each row in \`data/wikisource-pending.json\` names its proposed category; create the category, set \`category\` to its slug and import.`);
  L();
  L("| Proposed category | Slug | Works | Examples |");
  L("|---|---|---|---|");
  for (const f of PROPOSED_FORMS) {
    const rows = pending.filter((x) => x.form?.key === f.key);
    if (rows.length) L(`| ${f.proposed!.nameBangla} (${f.proposed!.name}) | \`${f.category}\` | ${rows.length} | ${rows.slice(0, 3).map((x) => x.row.titleBangla).join(", ")} |`);
  }
  const unknown = pending.filter((x) => !x.form);
  // For tuning scripts/wikisource/classify.ts: what each unclassified work carries.
  writeFileSync(
    "data/.wikisource-cache/unknown-forms.json",
    JSON.stringify(unknown.map((x) => ({ title: x.row.titleBangla, author: x.row.author, categories: [...new Set([...x.c.index.categories, ...x.v.categories])], types: x.c.wikidataTypes })), null, 1)
  );
  if (unknown.length) L(`| *Form unknown — needs a person to choose* | — | ${unknown.length} | ${unknown.slice(0, 3).map((x) => x.row.titleBangla).join(", ")} |`);
  L();
  L("## Included works per author (ready + pending)");
  L();
  L("| Author | Died | Ready | Pending |");
  L("|---|---|---|---|");
  const authors = count(included, (x) => x.row.author);
  for (const [a] of authors) {
    const d = included.find((x) => x.row.author === a)!.row.authorDeathYear;
    L(`| ${a} | ${d} | ${ready.filter((x) => x.row.author === a).length} | ${pending.filter((x) => x.row.author === a).length} |`);
  }
  L();
  L("## Excluded, by reason");
  L();
  L("| Reason | Works |");
  L("|---|---|");
  for (const [r, v] of count(excluded, (x) => reasonKey(x.reason))) L(`| ${r} | ${v} |`);
  L();
  L("Every excluded scan, with its exact reason, is in `data/wikisource-excluded.json`.");
  L();
  L("## Titles romanised by the script (please check)");
  L();
  L("Wikidata has no English title for these, so `title` was romanised by rule. The URL slug is made from it.");
  L();
  for (const x of included.filter((i) => i.romanized)) L(`- ${x.row.titleBangla} → ${x.row.title}`);
  L();
  L("## Spot-check: 20 random entries");
  L();
  L("SPOT_CHECK_PLACEHOLDER");
  L();
  const inCatalog = excluded.filter((x) => x.reason.startsWith("already in our catalog"));
  L("## Already in our catalog: add the link to the existing book");
  L();
  L("These passed every check but the book is already in the catalog, so they aren't in the import. Add the link on /admin/books (the book's \"বাইরের সাইটে বিনামূল্যের কপি\" box).");
  L();
  L("| Work | Author | Wikisource |");
  L("|---|---|---|");
  for (const x of inCatalog) L(`| ${x.title} | ${x.author} | ${x.wikisource} |`);
  L();
  L("## Every excluded scan");
  L();
  L("| Work | Author | Scan | Reason |");
  L("|---|---|---|---|");
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  for (const x of excluded) L(`| ${cell(x.title)} | ${cell(x.author)} | ${cell(x.scan)} | ${cell(x.reason)} |`);
  writeFileSync("data/wikisource-report.md", lines.join("\n") + "\n");
  writeFileSync("data/.wikisource-cache/spot-check-sample.json", JSON.stringify(sample.map((x) => ({ row: x.row, authors: x.c.authors, translators: x.c.translators, editors: x.c.editors, scans: x.scans, mainPage: x.c.mainPage, v: x.v })), null, 2));

  console.log(`\nready ${ready.length}, pending ${pending.length}, excluded ${excluded.length}; network calls: ${networkCalls}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
