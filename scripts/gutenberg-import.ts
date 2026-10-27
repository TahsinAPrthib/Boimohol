// Prepares a catalog import of about a thousand of Project Gutenberg's most
// downloaded public-domain books, each linking to its Gutenberg page. Nothing
// is written to any database: the output is files for a person to review and
// import through /admin/books.
//
//   npx tsx scripts/gutenberg/catalog.ts          (once; see its header)
//   npx tsx --env-file=.env scripts/gutenberg-import.ts
//
// Writes
//   data/gutenberg-import-1.json, -2.json ...  rows for the admin import, at
//                                              most 500 per file: new books,
//                                              then links for catalog books
//   data/gutenberg-unfit.json                  selected books that fit none of
//                                              our categories (not imported)
//   data/gutenberg-excluded.json               every book more downloaded than
//                                              the last one selected that was
//                                              left out, with the reason
//   data/gutenberg-report.md                   counts, decisions, exclusions
//
// The rules, in order, for each book from the most downloaded down:
//   1. A text, in English or Bangla only (Gutenberg has no Bangla books).
//   2. At least one named author; not "Anonymous", "Unknown" or "Various"
//      (an anthology without a single author); not one volume of a set.
//   3. Every author died in or before (this year - 61): the catalog's death
//      year, cross-checked against Wikidata where Gutenberg links the author
//      to Wikipedia; when the two differ, the later year counts.
//   4. A translation (a translator is credited, or the author didn't write in
//      English) needs a named translator who also passes rule 3.
//   5. Anyone else who added text (editor, introduction, commentary, notes)
//      must pass rule 3 too; an illustrator known to have died after the
//      cutoff rules the book out.
//   6. Not a recent release (ebook #77000 on, released from October 2025):
//      Gutenberg's counts cover the last 30 days, so a new release can rank
//      on a short spike. Left out, and the selection goes further down.
//   7. One row per work: the most downloaded edition.
//   8. Matched to our categories; books that fit none are listed, not forced.
//   9. Books already in our catalog get the Gutenberg link added instead.
//
// Each row credits its translator (`translator`). A Bangla title is shown
// only when it is a genuine Bangla one (scripts/gutenberg/titles.ts); other
// Bangla Wikipedia titles become hidden search aliases.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { Agent, Ebook } from "./gutenberg/catalog";
import { peopleByWikipedia, worksFor, type PersonFacts, type WorkFacts } from "./gutenberg/wikidata";
import { formOf, LEFT_OUT_BY_HAND, MYTH_BY_HAND, NOT_MYTH, type GForm } from "./gutenberg/forms";
import { GENUINE_BANGLA_TITLES } from "./gutenberg/titles";
import { GUTENBERG_KNOWN } from "./gutenberg/descriptions";
import { networkCalls } from "./wikisource/http";
import { bookImportRowSchema } from "../src/lib/book-schema";

const PD_CUTOFF = new Date().getUTCFullYear() - 61;
const TARGET = 1000;
const MAX_IMPORT_ROWS = 500; // same as the admin import
const ENGLISH = "Q1860";
const RECENT_FROM_ID = 77000; // released from 2025-10-07, a year before the feed
// One part of a work whose whole is selected, under a title the edition
// check can't tie to it.
const PART_OF_SELECTED: Record<number, string> = {
  8789: "the Inferno alone (Cary's translation): one part of The Divine Comedy, selected whole (#8800)",
};

type Row = {
  title: string;
  titleBangla: string | null;
  author: string;
  translator?: string;
  searchAliases?: string[];
  category: string;
  description: string;
  language: "en";
  publishYear: number | null;
  authorDeathYear: number;
  isPublicDomain: true;
  sources: { url: string; rightsBasis: string }[];
};

import {
  bnYear,
  catalogSpelling,
  knownAuthors,
  possessiveAny,
  listOf,
  LANGUAGE_BN,
  FOREIGN_LCC,
  TEXT_ROLES,
  IMAGE_ROLES,
  VOLUME,
  displayName,
  mainTitle,
  surname,
  matchKey,
  sameTitle,
  wikidataIsPerson,
  workTitle,
  sameSurname,
} from "./gutenberg/rules";

// As in scripts/gutenberg-all.ts: facts is Wikidata's item when it is that
// person (wikidataIsPerson), anyFacts the item of the page Gutenberg gives;
// year is shown and stored, ruleYear decides the cutoff.
type Person = {
  agent: Agent;
  facts: PersonFacts | undefined;
  anyFacts: PersonFacts | undefined;
  year: number | null;
  ruleYear: number | null;
  text: string | null;
  note: string | null;
};
type Candidate = { book: Ebook; authors: Person[]; translators: Person[]; others: { role: string; p: Person }[]; work?: WorkFacts };

async function main() {
  const all = JSON.parse(readFileSync("data/.gutenberg-cache/catalog.json", "utf8")) as Ebook[];
  const ranked = [...all].sort((a, b) => b.downloads - a.downloads);

  // Rules 1-2 and a first, catalog-only pass of rule 3, to bound the
  // Wikidata lookups to a pool a little larger than we need.
  const catalogReason = (b: Ebook): string | null => {
    if (b.type !== "Text") return "not a text (audio, image or data)";
    if (b.languages.length !== 1 || !["en", "bn"].includes(b.languages[0])) return "not in English or Bangla";
    const authors = b.roles.aut ?? [];
    if (!authors.length) return "no named author (anonymous, or only an editor or translator credited)";
    if (authors.some((a) => /^various\b/i.test(a.name))) return "anthology without a single author (\"Various\")";
    if (authors.some((a) => /^(anonymous|unknown)\b/i.test(a.name))) return "anonymous";
    if (VOLUME.test(b.title)) return "one volume of a multi-volume work";
    return null;
  };
  const funnel = new Map<string, number>();
  const bump = (r: string) => funnel.set(r, (funnel.get(r) ?? 0) + 1);
  const pool: Ebook[] = [];
  for (const b of ranked) {
    const r = catalogReason(b);
    if (r) {
      bump(r);
      continue;
    }
    if ((b.roles.aut ?? []).some((a) => a.death !== null && a.death > PD_CUTOFF)) {
      bump("author died after the cutoff (catalog)");
      continue;
    }
    pool.push(b);
    if (pool.length >= 2600) break;
  }

  // Wikidata for everyone in the pool, and for the works.
  const people = pool.flatMap((b) => Object.values(b.roles).flat());
  const facts = await peopleByWikipedia([...new Set(people.flatMap((a) => a.wikipedia.filter((u) => /\/\/en\.wikipedia\.org\//.test(u))))]);
  const works = await worksFor(pool.map((b) => ({ id: b.id, wikipedia: b.wikipedia })));
  // A Wikipedia page Gutenberg links to more than one person is about all of
  // them ("Aylmer and Louise Maude"): its name and dates fit neither, so such
  // a person keeps Gutenberg's own name and year.
  const https = (u: string) => u.replace(/^http:/, "https:");
  const agentsByPage = new Map<string, Set<string>>();
  for (const a of people) for (const u of a.wikipedia) agentsByPage.set(https(u), (agentsByPage.get(https(u)) ?? new Set()).add(a.id));
  const person = (a: Agent): Person => {
    const found = a.wikipedia.filter((u) => (agentsByPage.get(https(u))?.size ?? 0) < 2).flatMap((u) => (facts.has(u) ? [{ u, f: facts.get(u)! }] : []));
    const anyFacts = found[0]?.f;
    const f = found.find(({ u, f }) => wikidataIsPerson(a, f.nameEn, u))?.f;
    const wd = f?.death ?? null;
    const shown = (): Pick<Person, "year" | "text" | "note"> => {
      if (a.death !== null && wd && wd.year !== a.death) {
        const later = Math.max(a.death, wd.year);
        return { year: later, text: later === wd.year ? wd.text : `${bnYear(later)} সালে`, note: `catalog ${a.death}, Wikidata ${wd.year}` };
      }
      if (wd) return { year: wd.year, text: wd.text, note: null };
      if (a.death !== null) return { year: a.death, text: `${bnYear(a.death)} সালে`, note: null };
      return { year: null, text: null, note: null };
    };
    const s = shown();
    const anyYear = anyFacts?.death?.year ?? null;
    const ruleYear = a.death !== null ? Math.max(s.year!, anyYear ?? s.year!) : s.year;
    return { agent: a, facts: f, anyFacts, ...s, ruleYear };
  };

  const excluded: { id: number; title: string; author: string; downloads: number; reason: string }[] = [];
  const recentDropped: { id: number; title: string; author: string; downloads: number }[] = [];
  const discrepancies: { id: number; who: string; note: string }[] = [];
  const selected: Candidate[] = [];
  const seenWorks = new Map<string, Candidate>();
  const failName = (p: Person) => displayName(p.agent);

  for (const b of ranked) {
    if (selected.length >= TARGET) break;
    const exclude = (reason: string) => {
      excluded.push({ id: b.id, title: b.title, author: (b.roles.aut ?? []).map((a) => a.name).join("; ") || "—", downloads: b.downloads, reason });
      bump(reason.replace(/\(.*\)/, "").replace(/\d{4}/g, "YYYY").trim());
    };
    const early = catalogReason(b);
    if (early) {
      excluded.push({ id: b.id, title: b.title, author: (b.roles.aut ?? []).map((a) => a.name).join("; ") || "—", downloads: b.downloads, reason: early });
      continue;
    }
    if (!pool.includes(b)) {
      exclude(`author died after ${PD_CUTOFF} (Gutenberg catalog)`);
      continue;
    }
    if (PART_OF_SELECTED[b.id]) {
      exclude(PART_OF_SELECTED[b.id]);
      continue;
    }
    const authors = (b.roles.aut ?? []).map(person);
    const translators = (b.roles.trl ?? []).map(person);
    const others = Object.entries(b.roles)
      .filter(([role]) => TEXT_ROLES[role] || IMAGE_ROLES[role])
      .flatMap(([role, agents]) => agents.map((a) => ({ role, p: person(a) })));
    for (const p of [...authors, ...translators, ...others.map((o) => o.p)]) if (p.note) discrepancies.push({ id: b.id, who: p.agent.name, note: p.note });

    const unknownAuthor = authors.find((p) => p.ruleYear === null);
    if (unknownAuthor) {
      exclude(`author's death year is unknown (${failName(unknownAuthor)})`);
      continue;
    }
    const lateAuthor = authors.find((p) => p.ruleYear! > PD_CUTOFF);
    if (lateAuthor) {
      exclude(`author died in ${lateAuthor.ruleYear}, after ${PD_CUTOFF} (${failName(lateAuthor)}${lateAuthor.note ? `; ${lateAuthor.note}` : ""})`);
      continue;
    }
    const authorLanguages = authors.flatMap((p) => p.anyFacts?.languages ?? []);
    const wroteInEnglish = authorLanguages.includes(ENGLISH);
    const foreignByWikidata = authorLanguages.length > 0 && !wroteInEnglish;
    const foreignByClass = authorLanguages.length === 0 && b.lcc.some((c) => FOREIGN_LCC.test(c));
    const translationSubject = b.lcsh.some((s) => /translations into english/i.test(s));
    const isTranslation = translators.length > 0 || foreignByWikidata || foreignByClass || translationSubject;
    if (isTranslation && translators.length === 0) {
      exclude(`translation with no named translator (${foreignByWikidata ? "the author didn't write in English, per Wikidata" : foreignByClass ? `foreign-literature class ${b.lcc.join(", ")}` : "subject: translations into English"})`);
      continue;
    }
    const badTranslator = translators.find((p) => p.ruleYear === null || p.ruleYear > PD_CUTOFF);
    if (badTranslator) {
      exclude(badTranslator.ruleYear === null ? `translator's death year is unknown (${failName(badTranslator)})` : `translator died in ${badTranslator.ruleYear}, after ${PD_CUTOFF} (${failName(badTranslator)})`);
      continue;
    }
    const badText = others.find((o) => TEXT_ROLES[o.role] && (o.p.ruleYear === null || o.p.ruleYear > PD_CUTOFF));
    if (badText) {
      exclude(badText.p.ruleYear === null ? `${TEXT_ROLES[badText.role]}'s death year is unknown (${failName(badText.p)})` : `${TEXT_ROLES[badText.role]} died in ${badText.p.ruleYear}, after ${PD_CUTOFF} (${failName(badText.p)})`);
      continue;
    }
    const badImage = others.find((o) => IMAGE_ROLES[o.role] && o.p.ruleYear !== null && o.p.ruleYear > PD_CUTOFF);
    if (badImage) {
      exclude(`${IMAGE_ROLES[badImage.role]} died in ${badImage.p.ruleYear}, after ${PD_CUTOFF} (${failName(badImage.p)})`);
      continue;
    }
    const authorName = (p: Person) => p.facts?.nameEn ?? displayName(p.agent);
    // Wikidata's Gutenberg-ID claim sometimes sits on a part (ebook 887,
    // "Intentions", points at its essay "The Critic as Artist") or on an
    // edition with its own label ("Butcher & Lang's Odyssey"). Trust the work
    // only when its title agrees with Gutenberg's.
    const found = works.get(b.id);
    const work = found && (!found.nameEn || sameTitle(b.title, found.nameEn)) ? found : undefined;
    // Rule 6, after the others so only books that would otherwise be in are
    // counted -- and before rule 7, so an older edition of the same work can
    // still take its place.
    if (b.id >= RECENT_FROM_ID) {
      recentDropped.push({ id: b.id, title: b.title, author: authors.map((p) => displayName(p.agent)).join("; "), downloads: b.downloads });
      exclude(`recent release (ebook #${b.id}, ${b.issued ?? "date unknown"}): in the top downloads on a 30-day spike`);
      continue;
    }
    // An edition is the same work as an earlier one when Wikidata ties both
    // to one item, or their titles agree (see workTitle).
    const who = authors.map((p) => surname(authorName(p))).join("+");
    const keys = [work ? `${who}|${work.id}` : null, `${who}|${workTitle(b.title, authors.map(authorName))}`].filter((k): k is string => k !== null);
    const earlier = keys.map((k) => seenWorks.get(k)).find(Boolean);
    if (earlier) {
      exclude(`another edition of the same work (kept #${earlier.book.id})`);
      continue;
    }
    const c: Candidate = { book: b, authors, translators, others, work };
    for (const k of keys) seenWorks.set(k, c);
    selected.push(c);
  }
  const lastDownloads = selected[selected.length - 1]?.book.downloads ?? 0;

  // ---- rows ----
  const catalog = await existingCatalog();
  // An author the catalog already has keeps the catalog's spelling (see
  // catalogSpelling).
  const known = knownAuthors([...catalog.values()].flat());
  const nameOf = (p: Person) => catalogSpelling(p.facts?.nameEn ?? displayName(p.agent), p.year, known);
  const nameBnOr = (p: Person) => p.facts?.nameBn ?? nameOf(p);
  const rows: { c: Candidate; form: GForm; row: Row; linked: boolean; why: string }[] = [];
  const seenRows = new Set<string>(); // one row per work, by its final title
  const unfit: { id: number; title: string; author: string; downloads: number; why: string; url: string }[] = [];
  for (const c of selected) {
    const b = c.book;
    const formResult = formOf(b);
    const author = listOf(c.authors.map(nameOf));
    // Wikidata's English label for the work is its usual title; Gutenberg's
    // own carries subtitles and cataloguing.
    const wdTitle = c.work?.nameEn && c.work.nameEn.length <= 150 && !/^Q\d+$/.test(c.work.nameEn) ? c.work.nameEn : null;
    const title = mainTitle(wdTitle ?? b.title);
    const url = `https://www.gutenberg.org/ebooks/${b.id}`;
    if (!formResult.form) {
      unfit.push({ id: b.id, title, author, downloads: b.downloads, why: formResult.why, url });
      continue;
    }
    const form = formResult.form;
    const original = c.translators.length
      ? (c.work?.languages ?? []).concat(c.authors.flatMap((p) => p.facts?.languages ?? [])).map((q) => LANGUAGE_BN[q]).find((l) => l && l !== "ইংরেজি") ?? null
      : "ইংরেজি";
    const neutral =
      `${possessiveAny(listOf(c.authors.map(nameBnOr)))} ${original ? `${original} ` : ""}${form.noun}` +
      (c.translators.length ? `, ${possessiveAny(listOf(c.translators.map(nameBnOr)))} ইংরেজি অনুবাদে` : "") +
      "।";
    const solo = c.authors.length === 1 && c.translators.length === 0 && !c.others.some((o) => TEXT_ROLES[o.role]);
    const clauses = [
      ...c.authors.map((p) => `লেখক ${solo ? "" : `${nameBnOr(p)} `}${p.text}`),
      ...c.translators.map((p) => `অনুবাদক ${nameBnOr(p)} ${p.text}`),
      ...c.others.filter((o) => TEXT_ROLES[o.role]).map((o) => `${o.role === "edt" ? "সম্পাদক" : "ভূমিকা/টীকার লেখক"} ${nameBnOr(o.p)} ${o.p.text}`),
    ];
    const rightsBasis = `${listOf(clauses)} মারা গেছেন; কপিরাইটের মেয়াদ শেষ। উৎস: প্রজেক্ট গুটেনবার্গ`;
    const bnwikiTitle = c.work?.bnwiki ? c.work.bnwiki.replace(/\s*\([^)]*\)\s*$/, "").trim() : null;
    const genuine = bnwikiTitle !== null && GENUINE_BANGLA_TITLES.has(b.id);
    const titleBangla = genuine ? bnwikiTitle : null;
    let row: Row = {
      title,
      titleBangla,
      author,
      ...(c.translators.length ? { translator: listOf(c.translators.map(nameOf)) } : {}),
      ...(bnwikiTitle && !genuine ? { searchAliases: [bnwikiTitle] } : {}),
      category: form.category,
      description: GUTENBERG_KNOWN[b.id] ?? neutral,
      language: "en",
      publishYear: null,
      authorDeathYear: Math.max(...c.authors.map((p) => p.year!)),
      isPublicDomain: true,
      sources: [{ url, rightsBasis }],
    };
    // Already in the catalog: the row takes the catalog book's exact title and
    // author so the admin import matches it and only adds the link.
    const firstAuthor = surname(nameOf(c.authors[0]));
    const hit = [title, mainTitle(b.title), bnwikiTitle]
      .filter((t): t is string => !!t)
      .flatMap((t) => catalog.get(matchKey(t)) ?? [])
      .find((cb) => sameSurname(surname(cb.author), firstAuthor) || (bnwikiTitle !== null && cb.titleBangla === bnwikiTitle));
    // A link row changes nothing about the catalog book but its links, so it
    // carries the book's identity and nothing of its own.
    if (hit) {
      row = { ...row, title: hit.title, titleBangla: hit.titleBangla, author: hit.author, category: hit.category };
      delete row.translator;
      delete row.searchAliases;
    }
    // Editions Wikidata didn't tie to one work (or tied to different items)
    // still meet here, under the title they'd be shown with.
    const rowKey = `${surname(row.author)}|${matchKey(row.title)}`;
    if (seenRows.has(rowKey)) {
      excluded.push({ id: b.id, title: b.title, author: author, downloads: b.downloads, reason: "another edition of the same work (same title and author as a more downloaded one)" });
      continue;
    }
    seenRows.add(rowKey);
    rows.push({ c, form, row, linked: Boolean(hit), why: formResult.why });
  }

  for (const r of rows) {
    const check = bookImportRowSchema.safeParse(r.row);
    if (!check.success) throw new Error(`#${r.c.book.id} "${r.row.title}" fails the import schema: ${check.error.issues.map((i) => i.message).join("; ")}`);
  }

  // ---- files ----
  const fresh = rows.filter((r) => !r.linked);
  const linked = rows.filter((r) => r.linked);
  const ordered = [...fresh, ...linked];
  // What the files this run replaces held, for the report's list of changes.
  const idOf = (url: string) => Number(url.split("/").pop());
  const previous = new Map<number, string>();
  for (const f of readdirSync("data").filter((f) => /^gutenberg-import-\d+\.json$/.test(f)))
    for (const r of JSON.parse(readFileSync(`data/${f}`, "utf8")) as Row[]) previous.set(idOf(r.sources[0].url), r.category);
  if (existsSync("data/gutenberg-unfit.json"))
    for (const u of JSON.parse(readFileSync("data/gutenberg-unfit.json", "utf8")) as { id: number }[]) previous.set(u.id, "unfit");
  for (const f of readdirSync("data").filter((f) => /^gutenberg-import-\d+\.json$/.test(f))) rmSync(`data/${f}`);
  const tidy = (r: Row): Row => ({
    title: r.title,
    titleBangla: r.titleBangla,
    author: r.author,
    ...(r.translator ? { translator: r.translator } : {}),
    ...(r.searchAliases?.length ? { searchAliases: r.searchAliases } : {}),
    category: r.category,
    description: r.description,
    language: r.language,
    publishYear: r.publishYear,
    authorDeathYear: r.authorDeathYear,
    isPublicDomain: r.isPublicDomain,
    sources: r.sources,
  });
  const files: string[] = [];
  for (let i = 0; i < ordered.length; i += MAX_IMPORT_ROWS) {
    const file = `data/gutenberg-import-${files.length + 1}.json`;
    writeFileSync(file, JSON.stringify(ordered.slice(i, i + MAX_IMPORT_ROWS).map((r) => tidy(r.row)), null, 2) + "\n");
    files.push(file);
  }
  writeFileSync("data/gutenberg-unfit.json", JSON.stringify(unfit, null, 2) + "\n");
  writeFileSync("data/gutenberg-excluded.json", JSON.stringify(excluded, null, 2) + "\n");

  // ---- report ----
  const count = <T,>(xs: T[], key: (x: T) => string) => {
    const m = new Map<string, number>();
    for (const x of xs) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  const lines: string[] = [];
  const L = (s = "") => lines.push(s);
  L("# Project Gutenberg import — review report");
  L();
  L(`Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/gutenberg-import.ts\` from Gutenberg's official RDF catalog feed (\`cache/epub/feeds/rdf-files.tar.bz2\`, downloaded 2026-10-16; download counts are Gutenberg's last-30-days figures). Public-domain cutoff: died in **${PD_CUTOFF} or earlier**.`);
  L();
  L("## Totals");
  L();
  L("| | Books |");
  L("|---|---|");
  L(`| Gutenberg catalog | ${all.length} |`);
  L(`| Selected: the ${selected.length} most downloaded that pass every rule (down to ${lastDownloads} downloads) | ${selected.length} |`);
  L(`| New books to import (${files.map((f) => `\`${f}\``).join(", ")}) | ${fresh.length} |`);
  L(`| Links for books already in the catalog (same files, at the end) | ${linked.length} |`);
  L(`| Selected but not imported: reference works, manuals, cookbooks and a few undecided (\`data/gutenberg-unfit.json\`) | ${unfit.length} |`);
  L(`| Left out while selecting, with reasons (\`data/gutenberg-excluded.json\`) | ${excluded.length} |`);
  L();
  L("**Language.** Gutenberg has no Bangla books, so every row is English (`language: \"en\"` — the language of the text the link leads to, including English translations).");
  L();
  L(`**Descriptions.** ${rows.filter((r) => GUTENBERG_KNOWN[r.c.book.id]).length} very well-known works got an original one-sentence Bangla description (\`scripts/gutenberg/descriptions.ts\`); the rest a neutral line (author, original language, form, translator), e.g. “${fresh.find((r) => !GUTENBERG_KNOWN[r.c.book.id])?.row.description ?? ""}”`);
  L();
  L(`**Bangla titles.** Shown only where the book has a genuine, well-established Bangla title (\`scripts/gutenberg/titles.ts\`): ${fresh.filter((r) => r.row.titleBangla).length} new books — ${fresh.filter((r) => r.row.titleBangla).map((r) => r.row.titleBangla).join(", ")}. The other ${fresh.filter((r) => r.row.searchAliases?.length).length} Bangla Wikipedia titles (transliterations such as “${fresh.find((r) => r.c.book.id === 1342)?.row.searchAliases?.[0] ?? ""}”, or names such as “${fresh.find((r) => r.c.book.id === 1524)?.row.searchAliases?.[0] ?? ""}”) are hidden search aliases (\`searchAliases\`): never shown, but a search in Bangla script finds the book. Link rows carry the catalog book's own titles; \`data/catalog-title-corrections.json\` (optional, from \`scripts/catalog-title-corrections.ts\`) applies the same rule to the catalog's own foreign books — 54 update rows that hide a transliterated Bangla title and keep it as a search alias.`);
  L();
  const translated = fresh.filter((r) => r.c.translators.length);
  L(`**Translators.** ${translated.length} new books are translations; each row credits its translator (\`translator\`, shown on the book page as “অনুবাদ: …”). Every translator passed the same death-year rule as the authors — Gutenberg's year, cross-checked with Wikidata where Gutenberg links the person to Wikipedia (${translated.flatMap((r) => r.c.translators).filter((p) => p.facts?.death).length} of ${translated.flatMap((r) => r.c.translators).length} found there), the later year counting. A translation with no named translator, or one whose translator died after ${PD_CUTOFF} or has no known death year, is left out (see the exclusion reasons). Link rows don't set a translator: they add a link to a catalog book and change nothing else about it; the link's rights note names the translator.`);
  L();
  const peopleInRows = rows.flatMap((r) => [...r.c.authors, ...r.c.translators]);
  L(`**Wikidata cross-check.** ${peopleInRows.filter((p) => p.facts?.death).length} of the ${peopleInRows.length} authors and translators in the rows were found on Wikidata with a death date (through the Wikipedia page Gutenberg links them to); the rest rely on Gutenberg's catalog year alone.`);
  L();
  const myth = rows.filter((r) => r.row.category === "puran-lokkotha");
  const undecided = unfit.filter((u) => LEFT_OUT_BY_HAND[u.id] === "undecided");
  const notReviewed = unfit.filter((u) => !LEFT_OUT_BY_HAND[u.id]);
  L("## Decisions applied (2026-10-16)");
  L();
  L(`1. **Bangla titles:** only genuine Bangla titles are shown; transliterations are search aliases (above).`);
  L(`2. **পুরাণ ও লোককথা:** ${myth.length} books moved there (listed below), from all the selected books, including the ones first listed as fitting no category and the children's books.`);
  L(`3. **Recent releases dropped:** ${recentDropped.length} books released from October 2025 (ebook #${RECENT_FROM_ID} on) that passed every other rule were left out; the selection went further down the list to keep ${TARGET}. Listed below.`);
  L(`4. **Non-fiction first listed as fitting no category:** essays, philosophy, religion, science (with mathematics and economics) and letters now go to \`probondho\`, plain history to \`itihash-jiboni\`, and *How to Live on 24 Hours a Day* to \`atmounnoyon\`; reference works, manuals and cookbooks stay out. **What's left: ${undecided.length} books** — ${undecided.map((u) => `*${u.title}*`).join(", ")} — law treatises and medical case studies, which no rule covers; they stay out until you decide.${notReviewed.length ? ` **Not yet reviewed: ${notReviewed.length}** (new in this run) — ${notReviewed.map((u) => `*${u.title}*`).join(", ")}.` : ""}`);
  L(`5. **Language filter:** every row is \`en\`; the library's অন্যান্য ভাষা chip shows every language except Bangla, so the catalog's own foreign books (*Crime and Punishment* is \`ru\`) appear under it too.`);
  L();
  L("## পুরাণ ও লোককথা");
  L();
  L("Myths, legends, fables and fairy tales — collections and retellings — and the ancient epics that are a mythology's own texts, as for the Bangla works (the Mahabharata). Books that only use such material stay in their own category.");
  L();
  L("| Book | Author | Was | Now |");
  L("|---|---|---|---|");
  for (const r of myth) L(`| [${cell(r.row.title)}](${r.row.sources[0].url}) | ${cell(r.row.author)} | ${previous.get(r.c.book.id) ?? "new in this run"} | \`puran-lokkotha\` (${MYTH_BY_HAND[r.c.book.id]}) |`);
  L();
  const kept = rows.filter((r) => NOT_MYTH[r.c.book.id]);
  L(`Shelved with myths, or with a myth or folklore heading, but kept where they are (${kept.length}): ${kept.map((r) => `*${r.row.title}* (\`${r.row.category}\` — ${NOT_MYTH[r.c.book.id]})`).join("; ")}.`);
  L();
  L("## Recent releases dropped");
  L();
  L("| # | Book | Author | Downloads (30 days) |");
  L("|---|---|---|---|");
  for (const x of recentDropped) L(`| ${x.id} | ${cell(x.title.slice(0, 90))} | ${cell(x.author)} | ${x.downloads} |`);
  L();
  const nowIds = new Map<number, string>([...rows.map((r) => [r.c.book.id, r.row.category] as const), ...unfit.map((u) => [u.id, "unfit"] as const)]);
  if (previous.size) {
    const added = [...nowIds].filter(([id]) => !previous.has(id));
    const removed = [...previous].filter(([id]) => !nowIds.has(id));
    const moved = [...nowIds].filter(([id, cat]) => previous.has(id) && previous.get(id) !== cat);
    const label = (id: number) => {
      const r = rows.find((x) => x.c.book.id === id);
      const u = unfit.find((x) => x.id === id);
      const x = excluded.find((e) => e.id === id);
      return `#${id} *${cell((r?.row.title ?? u?.title ?? x?.title ?? "?").slice(0, 70))}*`;
    };
    L("## Changes from the previous files");
    L();
    L(`**Added (${added.length})** — further down the list, in place of the dropped and de-duplicated books: ${added.map(([id, cat]) => `${label(id)} (\`${cat}\`)`).join("; ") || "none"}.`);
    L();
    L(`**Removed (${removed.length}):** ${removed.map(([id]) => `${label(id)} — ${cell(excluded.find((e) => e.id === id)?.reason ?? "not selected")}`).join("; ") || "none"}.`);
    L();
    L(`**Category changed (${moved.length}):** ${moved.map(([id, cat]) => `${label(id)} ${previous.get(id)} → ${cat}`).join("; ") || "none"}.`);
    L();
  }
  L("## Translations");
  L();
  L("| Book | Original author | Translator | Translator died |");
  L("|---|---|---|---|");
  for (const r of translated) L(`| ${cell(r.row.title)} | ${cell(r.row.author)} | ${cell(r.row.translator ?? "")} | ${r.c.translators.map((p) => `${p.year}${p.facts?.death ? " (Wikidata)" : " (Gutenberg)"}`).join(", ")} |`);
  L();
  L("## New books by category");
  L();
  L("| Category | Books |");
  L("|---|---|");
  for (const [k, v] of count(fresh, (r) => r.row.category)) L(`| \`${k}\` | ${v} |`);
  L();
  L("| Form | Category | Books |");
  L("|---|---|---|");
  for (const [k, v] of count(fresh, (r) => `${r.form.noun}|${r.form.category}`)) L(`| ${k.split("|")[0]} | \`${k.split("|")[1]}\` | ${v} |`);
  L();
  L("## Links for books already in the catalog");
  L();
  L("| Catalog book | Author | Gutenberg |");
  L("|---|---|---|");
  for (const r of linked) L(`| ${cell(r.row.title)} | ${cell(r.row.author)} | ${r.row.sources[0].url} |`);
  L();
  L("## Selected, but not imported");
  L();
  L("| Book | Author | Downloads | Why |");
  L("|---|---|---|---|");
  for (const u of unfit) L(`| [${cell(u.title)}](${u.url}) | ${cell(u.author)} | ${u.downloads} | ${cell(u.why)} |`);
  L();
  L("## Excluded while selecting, by reason");
  L();
  L(`Every book with more downloads than the last one selected (${lastDownloads}) that was left out:`);
  L();
  L("| Reason | Books |");
  L("|---|---|");
  const reasonKey = (r: string) => r.replace(/\(.*\)/, "").replace(/-?\d{3,4}/g, "YYYY").trim();
  for (const [k, v] of count(excluded, (x) => reasonKey(x.reason))) L(`| ${cell(k)} | ${v} |`);
  L();
  L("The 60 most downloaded of them:");
  L();
  L("| # | Book | Author | Downloads | Reason |");
  L("|---|---|---|---|---|");
  for (const x of excluded.filter((x) => !/^not in English|^not a text/.test(x.reason)).slice(0, 60)) L(`| ${x.id} | ${cell(x.title.slice(0, 80))} | ${cell(x.author)} | ${x.downloads} | ${cell(x.reason)} |`);
  L();
  L("## Catalog and Wikidata disagree on a death year");
  L();
  L("The later year was used (the stricter choice).");
  L();
  for (const d of discrepancies.filter((d, i, a) => a.findIndex((x) => x.who === d.who) === i)) L(`- ${d.who}: ${d.note}`);
  L();
  L("## Per author (new books and links)");
  L();
  L("| Author | Books |");
  L("|---|---|");
  for (const [a, v] of count(rows, (r) => r.row.author).slice(0, 60)) L(`| ${cell(a)} | ${v} |`);
  L();
  L("## Spot-check");
  L();
  L("See `data/gutenberg-spot-check.md` (`scripts/gutenberg-spot-check.ts`).");
  writeFileSync("data/gutenberg-report.md", lines.join("\n") + "\n");
  const sample = [...fresh].sort((a, b) => ((a.c.book.id * 2654435761) % 1000) - ((b.c.book.id * 2654435761) % 1000)).slice(0, 20);
  writeFileSync(
    "data/.gutenberg-cache/spot-check-sample.json",
    JSON.stringify(sample.map((r) => ({ id: r.c.book.id, title: r.row.title, authors: r.c.authors.map((p) => ({ name: p.agent.name, wikipedia: p.agent.wikipedia, year: p.year })), translators: r.c.translators.map((p) => ({ name: p.agent.name, wikipedia: p.agent.wikipedia, year: p.year })) })), null, 2)
  );
  console.log(`selected ${selected.length} (down to ${lastDownloads} downloads): ${fresh.length} new + ${linked.length} links in ${files.join(", ")}; unfit ${unfit.length}; excluded ${excluded.length}; network calls ${networkCalls}`);
}

// Every book already in the catalog by title key (see matchKey); the author
// is checked by the caller. The database's books first, then
// data/catalog-import.json's.
type CatalogBook = { title: string; titleBangla: string | null; author: string; authorDeathYear: number | null; category: string };
async function existingCatalog(): Promise<Map<string, CatalogBook[]>> {
  const out = new Map<string, CatalogBook[]>();
  const add = (b: CatalogBook) => {
    for (const t of [b.title, b.titleBangla].filter((t): t is string => !!t)) {
      const k = matchKey(t);
      const list = out.get(k) ?? [];
      if (!list.some((x) => x.title === b.title && x.author === b.author)) list.push(b);
      out.set(k, list);
    }
  };
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      for (const b of await prisma.book.findMany({ select: { title: true, titleBangla: true, author: true, authorDeathYear: true, category: { select: { slug: true } } } }))
        add({ ...b, category: b.category.slug });
    } finally {
      await prisma.$disconnect();
    }
  }
  if (existsSync("data/catalog-import.json"))
    for (const b of JSON.parse(readFileSync("data/catalog-import.json", "utf8")) as { title: string; titleBangla?: string | null; author: string; authorDeathYear?: number | null; category: string }[])
      add({ title: b.title, titleBangla: b.titleBangla ?? null, author: b.author, authorDeathYear: b.authorDeathYear ?? null, category: b.category });
  return out;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
