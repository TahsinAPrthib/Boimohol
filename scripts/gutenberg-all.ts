// Prepares every book in Project Gutenberg's catalog that passes our rules --
// not only the most downloaded thousand (scripts/gutenberg-import.ts) -- for
// the large-file import on /admin/books, which marks them as not curated:
// the library, category pages and home page list curated books first, and
// search covers everything. Nothing is written to any database.
//
//   npx tsx scripts/gutenberg/catalog.ts          (once; see its header)
//   npx tsx --env-file=.env scripts/gutenberg-all.ts
//
// Writes
//   data/gutenberg-all-1.json, -2.json ...  rows for the large-file import,
//                                           10,000 per file: new books, then
//                                           links for books already in the
//                                           catalog
//   data/gutenberg-all-report.md            counts, exclusions, categories, size
//   data/.gutenberg-cache/spot-check-all-sample.json
//                                           50 rows chosen at random, for
//                                           scripts/gutenberg-spot-check.ts
//
// The rules (the curated import's, applied to the whole catalog):
//   1. A text (not audio, images or data), in English or Bangla only.
//   2. Named authors; not "Various" (anthologies, magazines), "Anonymous" or
//      "Unknown", nor more of them than the author field can credit.
//   3. Not a periodical, a magazine issue, an index or a catalogue.
//   4. Every author has a known death year of the cutoff or earlier --
//      Gutenberg's, cross-checked with Wikidata where Gutenberg links the
//      person to Wikipedia, the later year counting.
//   5. A translation names its translator, who passes rule 4 too; so does
//      anyone else who added text (editor, introduction, notes). An
//      illustrator known to have died after the cutoff rules a book out.
//   6. A single volume is left out when the complete set is in the catalog
//      too; otherwise each volume is a book of its own, its volume in its title.
//   7. One row per work: the most downloaded edition.
//   8. Books in the curated import (data/gutenberg-import-*.json) are left
//      to it, so they stay curated whichever file is imported first.
//   9. Our categories by subject; a book that fits none goes to অন্যান্য
//      (onnanno), with a description naming its subject.
// Rows already in the catalog become link rows, as in the curated import.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { Agent, Ebook } from "./gutenberg/catalog";
import { peopleByWikipedia, worksFor, type PersonFacts, type WorkFacts } from "./gutenberg/wikidata";
import { formOf, GFORMS, type GForm } from "./gutenberg/forms";
import { GENUINE_BANGLA_TITLES } from "./gutenberg/titles";
import { GUTENBERG_KNOWN } from "./gutenberg/descriptions";
import { networkCalls } from "./wikisource/http";
import {
  BANGLA,
  bnYear,
  displayName,
  FOREIGN_LCC,
  IMAGE_ROLES,
  LANGUAGE_BN,
  listOf,
  mainTitle,
  matchKey,
  possessiveAny,
  sameSurname,
  sameTitle,
  surname,
  TEXT_ROLES,
  VOLUME,
  workTitle,
} from "./gutenberg/rules";
import { bookImportRowSchema } from "../src/lib/book-schema";

const PD_CUTOFF = new Date().getUTCFullYear() - 61;
const FILE_ROWS = 10_000;
// The import's limits on the author and translator fields (src/lib/book-schema.ts).
const AUTHOR_MAX = 120;
const TRANSLATOR_MAX = 200;
const OTHER = "onnanno";
const ENGLISH = "Q1860";

// Rule 5 needs to know a translation when Gutenberg names no translator.
// Wikidata's languages "spoken, written or signed" are too wide (Tolstoy
// spoke English), so a book counts as translated when its first author is
// recorded as writing in other languages only -- or, where Wikidata doesn't
// say, has another native language. English here includes its varieties
// and Scots; Old English needs translating. Read by hand (2026-10-27): these
// people wrote the books in English themselves, and these books are
// translations Wikidata can't tell (Einstein also wrote in English).
const ENGLISHES = new Set(["Q1860", "Q7979", "Q7976", "Q1553250", "Q36395", "Q1472196", "Q3312722", "Q14549"]);
const WROTE_IN_ENGLISH = new Set([
  "Q557360", // Ármin Vámbéry
  "Q2404070", // Maarten Maartens
  "Q160702", // José Raúl Capablanca
  "Q157040", // Lajos Kossuth: speeches given in English
  "Q5082354", // Charles Saroléa
  "Q9381", // Adam Smith (Wikidata's native language is wrong)
  "Q910932", // Theodore Duka
  "Q964608", // Lucien Pissarro
]);
const WROTE_IN_ENGLISH_BOOKS = new Set([
  32966, // Engels (and Marx), Revolution and Counter-Revolution in Germany: written for the New-York Daily Tribune
]);
const TRANSLATED_BY_HAND: Record<number, string> = {
  69572: "Einstein, Fundamental Ideas and Problems of the Theory of Relativity: lecture given in German",
};
const writesOther = (f: PersonFacts | undefined) =>
  !!f &&
  !WROTE_IN_ENGLISH.has(f.id) &&
  (f.writing.length > 0 ? !f.writing.some((q) => ENGLISHES.has(q)) : f.native.length > 0 && !f.native.some((q) => ENGLISHES.has(q)));

// Periodicals and indexes, by shelf, subject heading or title.
const PERIODICAL_TITLE =
  /\b(magazine|monthly|weekly|quarterly|journal|gazette|review|chronicle|almanac|annual|punch|notes and queries|bulletin|proceedings|transactions|newsletter)\b.*\b(no\.?|number|vol\.?|volume|issue)\s*[0-9ivxlc]+|\b(no\.?|number|issue)\s*\d+\s*[,.]?\s*(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})/i;
const INDEX_TITLE = /^(the\s+)?index\b|\bindex (of|to) the project gutenberg\b|\bproject gutenberg (works|index)\b|^(a|the) (catalogue|catalog|bibliography) of\b/i;

// What a book is about when it fits none of our categories, for its
// description: Gutenberg's subject shelves, in Bangla.
const OTHER_NOUNS: [string, string][] = [
  ["Cooking & Drinking", "রান্না ও খাদ্য বিষয়ক বই"],
  ["Health & Medicine", "স্বাস্থ্য ও চিকিৎসা বিষয়ক বই"],
  ["Law & Criminology", "আইন ও অপরাধতত্ত্ব বিষয়ক বই"],
  ["Engineering & Technology", "প্রকৌশল ও প্রযুক্তি বিষয়ক বই"],
  ["Computers & Technology", "প্রযুক্তি বিষয়ক বই"],
  ["Mathematics", "গণিত বিষয়ক বই"],
  ["Music", "সংগীত বিষয়ক বই"],
  ["Architecture", "স্থাপত্য বিষয়ক বই"],
  ["Teaching & Education", "শিক্ষা বিষয়ক বই"],
  ["Language & Communication", "ভাষা বিষয়ক বই"],
  ["Business/Management", "ব্যবসা বিষয়ক বই"],
  ["Sports/Hobbies", "খেলাধুলা ও শখ বিষয়ক বই"],
  ["Crafts/Hobbies", "হাতের কাজ বিষয়ক বই"],
  ["Games/Video Games", "খেলা বিষয়ক বই"],
  ["Fashion", "পোশাক বিষয়ক বই"],
  ["Encyclopedias/Dictionaries/Reference", "তথ্যসূত্রের বই"],
  ["How To ...", "হাতে-কলমে শেখার বই"],
  ["Reports & Conference Proceedings", "প্রতিবেদন"],
  ["Art", "শিল্পকলা বিষয়ক বই"],
  ["Gardening", "বাগান বিষয়ক বই"],
];
const other = (noun: string): GForm => ({ key: "other", noun, category: OTHER });

// A book with no telling shelf or subject heading, by its Library of
// Congress class: one of our categories where the class is one, else
// অন্যান্য with the class's subject. First match wins.
const BY_CLASS: [RegExp, GForm][] = [
  [/^QA/, other("গণিত বিষয়ক বই")],
  [/^Q/, GFORMS.science],
  [/^(B|BC|BD|BH|BJ)$/, GFORMS.philosophy],
  [/^B[L-X]/, GFORMS.religion],
  [/^[DEF]/, GFORMS.history],
  [/^GN/, { key: "anthropology", noun: "নৃবিজ্ঞান বিষয়ক বই", category: "probondho" }],
  [/^GR/, { key: "mythology", noun: "লোককথার বই", category: "puran-lokkotha" }],
  [/^GV/, other("খেলাধুলা ও শখ বিষয়ক বই")],
  [/^GT/, other("রীতিনীতি বিষয়ক বই")],
  // Plain G is mostly voyages and exploration.
  [/^G$/, GFORMS.travel],
  [/^G/, other("ভূগোল বিষয়ক বই")],
  [/^H[B-J]/, GFORMS.economics],
  [/^H/, { key: "society", noun: "সমাজ বিষয়ক বই", category: "probondho" }],
  [/^J/, { key: "politics", noun: "রাজনীতি বিষয়ক বই", category: "probondho" }],
  [/^K/, other("আইন বিষয়ক বই")],
  [/^L/, other("শিক্ষা বিষয়ক বই")],
  [/^M/, other("সংগীত বিষয়ক বই")],
  [/^NA/, other("স্থাপত্য বিষয়ক বই")],
  [/^N/, other("শিল্পকলা বিষয়ক বই")],
  [/^(P|PE)$/, GFORMS.language],
  [/^R/, other("স্বাস্থ্য ও চিকিৎসা বিষয়ক বই")],
  [/^SB/, other("বাগান বিষয়ক বই")],
  [/^SF/, other("পশুপালন বিষয়ক বই")],
  [/^SH/, other("মাছ ধরা বিষয়ক বই")],
  [/^SK/, other("শিকার বিষয়ক বই")],
  [/^S/, other("কৃষি বিষয়ক বই")],
  [/^TX/, other("রান্না ও গৃহস্থালি বিষয়ক বই")],
  [/^TT/, other("হাতের কাজ বিষয়ক বই")],
  [/^T/, other("প্রকৌশল ও প্রযুক্তি বিষয়ক বই")],
  [/^[UV]/, other("সামরিক বিষয়ক বই")],
  [/^Z/, other("বই ও গ্রন্থাগার বিষয়ক বই")],
  [/^A/, other("তথ্যসূত্রের বই")],
];
const byClass = (b: Ebook) => b.lcc.map((c) => BY_CLASS.find(([re]) => re.test(c))?.[1]).find(Boolean);

const DRAMA_HEADING = /drama|plays|traged|comed|theat|farce|masque|opera|librett|dialogues/i;
const VERSE_HEADING = /poetry|poems|verse\b|sonnet|ballad|songs|hymns|epic|lyric|odes\b|elegies|fables|saga|romances|sufi|literature/i;
const CRITICISM_HEADING = /-- (history and criticism|criticism and interpretation|criticism, textual|criticism)\b|versification|-- (sources|knowledge|influence|style|technique)\b|authorship/i;
const HUMOUR_HEADING = /satire|\bhumor|humour|wit and|burlesques|parodies|caricatures/i;
const MYTH_HEADING = /^(tales|legends|folklore|fables|fairy tales|mythology|arthurian romances)\b|-- (folklore|legends)\b/i;
const MYTH_TITLE = /\b(myths?|mythology|legends?|folk-?lore|folk-?tales?|fairy[- ]tales?|fables|sagas?|goblins|superstitions|wonder[- ]tales)\b/i;
const MYTH_STUDY = /bible|criticism|psycholog|comparative|-- history\b/i;
const MYTH_NOUNS: [RegExp, string][] = [
  [/fable/i, "উপকথার সংকলন"],
  [/fairy/i, "রূপকথার সংকলন"],
  [/legend|arthur|saga/i, "কিংবদন্তির কাহিনি"],
  [/myth/i, "পুরাণকথা"],
  [/./, "লোককথার সংকলন"],
];
const mythForm = (text: string): GForm => ({ key: "mythology", noun: MYTH_NOUNS.find(([re]) => re.test(text))![1], category: "puran-lokkotha" });
const without = (b: Ebook, shelf: string): Ebook => ({ ...b, bookshelves: b.bookshelves.filter((s) => s !== `Category: ${shelf}`) });

// The curated import's forms (scripts/gutenberg/forms.ts) were checked book
// by book. Across the whole catalog, these rules mend what its shelves and
// headings get wrong, found by reading a random sample and counting
// (2026-10-27):
//  - Gutenberg's newer "Category:" shelves are assigned in bulk and are often
//    wrong. A play or a poem found from a shelf alone, when the subject
//    headings name no drama or verse, is decided without that shelf: books
//    on film, actors' memoirs and studies of poets were "plays".
//  - A literary study (class P, a criticism heading) is a প্রবন্ধ, not the
//    poems or plays it studies; satire and humour in prose is রম্যরচনা.
//  - Folk tales, legends and retold myths go to পুরাণ ও লোককথা, as in the
//    curated import: fiction with such a heading, and non-fiction titled as
//    myths, legends or folk tales -- not studies of them.
//  - Bible commentary and theology (class BS, BT, BV) is religion, not history.
//  - A book with no telling shelf or heading goes by its class (BY_CLASS).
//  - One that fits no category goes to অন্যান্য, named by its shelf or class.
function bulkForm(b: Ebook): GForm {
  let fit = formOf(b);
  if (fit.why === "set by hand" || fit.why.includes("(set by hand)")) return fit.form ?? other("বই");
  const heading = (re: RegExp) => b.lcsh.some((s) => re.test(s));
  if (fit.form?.key === "play" && b.lcsh.length > 0 && !heading(DRAMA_HEADING)) fit = formOf((b = without(b, "Plays/Films/Dramas")));
  if (fit.form?.key === "poetry" && b.lcsh.length > 0 && !heading(VERSE_HEADING)) fit = formOf((b = without(b, "Poetry")));
  const key = fit.form?.key ?? null;
  const prose = key === null || ["novel", "stories", "history", "essays", "philosophy", "religion", "science"].includes(key);
  if ((prose || key === "poetry" || key === "play") && b.lcc.some((c) => c.startsWith("P")) && heading(CRITICISM_HEADING))
    return { key: "criticism", noun: "সাহিত্য-সমালোচনার বই", category: "probondho" };
  const mythHeading = b.lcsh.find((s) => MYTH_HEADING.test(s) && !/fiction/i.test(s));
  if ((key === "novel" || key === "stories") && mythHeading) return mythForm(mythHeading);
  if (prose && key !== "novel" && key !== "stories" && MYTH_TITLE.test(b.title) && b.lcsh.some((s) => /myth|legend|folklore|fable|fairy|tales/i.test(s)) && !heading(MYTH_STUDY))
    return mythForm(b.title);
  if (key === "history" && b.lcc.some((c) => /^B[STV]/.test(c)) && !b.lcc.some((c) => /^[DEF]/.test(c))) return GFORMS.religion;
  if (fit.form) return fit.form;
  if (heading(HUMOUR_HEADING)) return { key: "humour", noun: "রম্যরচনা", category: "probondho" };
  const shelves = b.bookshelves.filter((s) => s.startsWith("Category: ")).map((s) => s.slice("Category: ".length));
  const byShelf = OTHER_NOUNS.find(([shelf]) => shelves.some((s) => s.startsWith(shelf)))?.[1];
  if (byShelf) return other(byShelf);
  const classed = byClass(b);
  return classed ?? other("বই");
}

type Row = {
  title: string;
  titleBangla: string | null;
  author: string;
  translator?: string;
  searchAliases?: string[];
  category: string;
  description: string;
  language: "en";
  publishYear: null;
  authorDeathYear: number;
  isPublicDomain: true;
  sources: { url: string; rightsBasis: string }[];
};
type Person = { agent: Agent; facts: PersonFacts | undefined; year: number | null; text: string | null; note: string | null };

async function main() {
  const all = JSON.parse(readFileSync("data/.gutenberg-cache/catalog.json", "utf8")) as Ebook[];
  const byDownloads = [...all].sort((a, b) => b.downloads - a.downloads || a.id - b.id);
  const curatedIds = new Set<number>();
  for (const f of readdirSync("data").filter((f) => /^gutenberg-import-\d+\.json$/.test(f)))
    for (const r of JSON.parse(readFileSync(`data/${f}`, "utf8")) as Row[]) for (const s of r.sources) curatedIds.add(Number(s.url.split("/").pop()));

  const funnel = new Map<string, number>();
  const bump = (reason: string) => funnel.set(reason, (funnel.get(reason) ?? 0) + 1);

  // Rules 1-3 and the catalog's own death years: what's worth asking Wikidata about.
  const catalogReason = (b: Ebook): string | null => {
    if (b.type !== "Text") return "1 not a text (audio, images, data)";
    if (b.languages.length !== 1 || !["en", "bn"].includes(b.languages[0])) return "1 not in English or Bangla only";
    const authors = b.roles.aut ?? [];
    if (!authors.length) return "2 no named author";
    if (authors.some((a) => /^various\b/i.test(a.name))) return "2 anthology or magazine without a single author (Various)";
    if (authors.some((a) => /^(anonymous|unknown)\b/i.test(a.name))) return "2 anonymous";
    if (b.bookshelves.includes("Category: Journals") || b.lcsh.some((s) => /periodicals/i.test(s)) || PERIODICAL_TITLE.test(b.title))
      return "3 periodical or magazine issue";
    if (INDEX_TITLE.test(b.title)) return "3 index or catalogue";
    if (authors.some((a) => a.death === null)) return "4 author's death year unknown (Gutenberg)";
    if (authors.some((a) => a.death! > PD_CUTOFF)) return `4 author died after ${PD_CUTOFF} (Gutenberg)`;
    return null;
  };
  const pool: Ebook[] = [];
  for (const b of byDownloads) {
    const reason = catalogReason(b);
    if (reason) bump(reason);
    else pool.push(b);
  }

  // Rule 6 needs every complete edition, so it's settled before editions are chosen.
  const setKey = (b: Ebook) =>
    `${(b.roles.aut ?? []).map((a) => surname(displayName(a))).join("+")}|${workTitle(b.title.replace(VOLUME, " "), (b.roles.aut ?? []).map(displayName))}`;
  const completeSets = new Set(pool.filter((b) => !VOLUME.test(b.title)).map(setKey));

  console.log(`catalog ${all.length}; pool ${pool.length}; asking Wikidata`);
  const people = pool.flatMap((b) => Object.values(b.roles).flat());
  const facts = await peopleByWikipedia([...new Set(people.flatMap((a) => a.wikipedia.filter((u) => /\/\/en\.wikipedia\.org\//.test(u))))]);
  const works = await worksFor(pool.map((b) => ({ id: b.id, wikipedia: b.wikipedia })));
  console.log(`wikidata: ${facts.size} people, ${works.size} works; network calls ${networkCalls}`);

  // As in the curated import: a page Gutenberg links to more than one person
  // is about all of them, so it settles nobody's dates.
  const https = (u: string) => u.replace(/^http:/, "https:");
  const agentsByPage = new Map<string, Set<string>>();
  for (const a of people) for (const u of a.wikipedia) agentsByPage.set(https(u), (agentsByPage.get(https(u)) ?? new Set()).add(a.id));
  const factsFor = (a: Agent) =>
    a.wikipedia
      .filter((u) => (agentsByPage.get(https(u))?.size ?? 0) < 2)
      .map((u) => facts.get(u))
      .find(Boolean);
  const person = (a: Agent): Person => {
    const f = factsFor(a);
    const wd = f?.death ?? null;
    if (a.death !== null && wd && wd.year !== a.death) {
      const later = Math.max(a.death, wd.year);
      return { agent: a, facts: f, year: later, text: later === wd.year ? wd.text : `${bnYear(later)} সালে`, note: `catalog ${a.death}, Wikidata ${wd.year}` };
    }
    if (wd) return { agent: a, facts: f, year: wd.year, text: wd.text, note: null };
    if (a.death !== null) return { agent: a, facts: f, year: a.death, text: `${bnYear(a.death)} সালে`, note: null };
    return { agent: a, facts: f, year: null, text: null, note: null };
  };

  type Candidate = { book: Ebook; authors: Person[]; translators: Person[]; others: { role: string; p: Person }[]; work?: WorkFacts; volume: string | null };
  const selected: Candidate[] = [];
  const seenWorks = new Map<string, Candidate>();
  let inCurated = 0;
  for (const b of pool) {
    const authors = (b.roles.aut ?? []).map(person);
    const translators = (b.roles.trl ?? []).map(person);
    const others = Object.entries(b.roles)
      .filter(([role]) => TEXT_ROLES[role] || IMAGE_ROLES[role])
      .flatMap(([role, agents]) => agents.map((a) => ({ role, p: person(a) })));
    const lateAuthor = authors.find((p) => p.year === null || p.year > PD_CUTOFF);
    if (lateAuthor) {
      bump(`4 author died after ${PD_CUTOFF} (Wikidata)`);
      continue;
    }
    if (TRANSLATED_BY_HAND[b.id]) {
      bump("5 translation with no named translator");
      continue;
    }
    const authorLanguages = authors.flatMap((p) => p.facts?.languages ?? []);
    const foreignByWikidata = (authorLanguages.length > 0 && !authorLanguages.includes(ENGLISH)) || (writesOther(authors[0].facts) && !WROTE_IN_ENGLISH_BOOKS.has(b.id));
    const foreignByClass = authorLanguages.length === 0 && b.lcc.some((c) => FOREIGN_LCC.test(c));
    const translationSubject = b.lcsh.some((s) => /translations into english/i.test(s));
    if ((translators.length > 0 || foreignByWikidata || foreignByClass || translationSubject) && translators.length === 0) {
      bump("5 translation with no named translator");
      continue;
    }
    if (translators.some((p) => p.year === null || p.year > PD_CUTOFF)) {
      bump("5 translator's death year unknown or after the cutoff");
      continue;
    }
    if (others.some((o) => TEXT_ROLES[o.role] && (o.p.year === null || o.p.year > PD_CUTOFF))) {
      bump("5 editor or introducer's death year unknown or after the cutoff");
      continue;
    }
    if (others.some((o) => IMAGE_ROLES[o.role] && o.p.year !== null && o.p.year > PD_CUTOFF)) {
      bump("5 illustrator died after the cutoff");
      continue;
    }
    const volumeMatch = b.title.match(VOLUME);
    if (volumeMatch && completeSets.has(setKey(b))) {
      bump("6 one volume of a set whose complete edition is in the catalog");
      continue;
    }
    const authorName = (p: Person) => p.facts?.nameEn ?? displayName(p.agent);
    const found = works.get(b.id);
    const work = found && (!found.nameEn || sameTitle(b.title, found.nameEn)) ? found : undefined;
    const volume = volumeMatch ? volumeMatch[0].replace(/[()—]/g, " ").replace(/\s+/g, " ").trim() : null;
    const who = authors.map((p) => surname(authorName(p))).join("+");
    const keys = [
      work && !volume ? `${who}|${work.id}` : null,
      `${who}|${workTitle(b.title, authors.map(authorName))}${volume ? `#${volume.toLowerCase()}` : ""}`,
    ].filter((k): k is string => k !== null);
    if (keys.some((k) => seenWorks.has(k))) {
      bump("7 another edition of the same work");
      continue;
    }
    const c: Candidate = { book: b, authors, translators, others, work, volume };
    for (const k of keys) seenWorks.set(k, c);
    // Rule 8 after the work is registered, so the curated edition still keeps
    // the other editions of its work out.
    if (curatedIds.has(b.id)) {
      inCurated++;
      bump("8 in the curated import (data/gutenberg-import-*.json)");
      continue;
    }
    selected.push(c);
  }
  console.log(`selected ${selected.length}`);

  // ---- rows ----
  const catalog = await existingCatalog();
  const catalogAuthors = [...new Set([...catalog.values()].flat().map((b) => b.author).filter((a) => !BANGLA.test(a)))];
  const spelled = (name: string) => {
    const [first, last] = [name.split(/\s+/)[0]?.[0]?.toLowerCase(), surname(name)];
    return catalogAuthors.find((a) => a !== name && a.split(/\s+/)[0]?.[0]?.toLowerCase() === first && sameSurname(surname(a), last)) ?? name;
  };
  const nameOf = (p: Person) => spelled(p.facts?.nameEn ?? displayName(p.agent));
  const nameBnOr = (p: Person) => p.facts?.nameBn ?? nameOf(p);
  const rows: { c: Candidate; form: GForm; row: Row; linked: boolean }[] = [];
  const seenRows = new Set<string>();
  for (const c of selected) {
    const b = c.book;
    const form = bulkForm(b);
    const author = listOf(c.authors.map(nameOf));
    const wdTitle = !c.volume && c.work?.nameEn && c.work.nameEn.length <= 150 && !/^Q\d+$/.test(c.work.nameEn) ? c.work.nameEn : null;
    let title = mainTitle(wdTitle ?? b.title);
    // A volume keeps its number, which the main title can lose with a subtitle.
    if (c.volume && !title.toLowerCase().includes(c.volume.toLowerCase())) title = `${title}, ${c.volume.replace(/^(vol(ume)?\.?|v\.)\s*/i, "Volume ")}`;
    if (title.length > 200) title = title.slice(0, 200).replace(/\s+\S*$/, "");
    const url = `https://www.gutenberg.org/ebooks/${b.id}`;
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
    let row: Row = {
      title,
      titleBangla: genuine ? bnwikiTitle : null,
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
    // A collection with more named contributors than the author field can
    // credit is left out, like the "Various" anthologies, rather than
    // credited in part.
    if (row.author.length > AUTHOR_MAX || (row.translator?.length ?? 0) > TRANSLATOR_MAX) {
      bump("2 more named authors or translators than one field can credit (a collection)");
      continue;
    }
    const firstAuthor = surname(nameOf(c.authors[0]));
    const hit = [title, mainTitle(b.title), bnwikiTitle]
      .filter((t): t is string => !!t)
      .flatMap((t) => catalog.get(matchKey(t)) ?? [])
      .find((cb) => sameSurname(surname(cb.author), firstAuthor) || (bnwikiTitle !== null && cb.titleBangla === bnwikiTitle));
    if (hit) {
      row = { ...row, title: hit.title, titleBangla: hit.titleBangla, author: hit.author, category: hit.category };
      delete row.translator;
      delete row.searchAliases;
    }
    const rowKey = `${surname(row.author)}|${matchKey(row.title)}`;
    if (seenRows.has(rowKey)) {
      bump("7 another edition of the same work (same title and author)");
      continue;
    }
    seenRows.add(rowKey);
    rows.push({ c, form, row, linked: Boolean(hit) });
  }
  for (const r of rows) {
    const check = bookImportRowSchema.safeParse(r.row);
    if (!check.success) throw new Error(`#${r.c.book.id} "${r.row.title}" fails the import schema: ${check.error.issues.map((i) => i.message).join("; ")}`);
  }

  // ---- files ----
  const fresh = rows.filter((r) => !r.linked);
  const linked = rows.filter((r) => r.linked);
  const ordered = [...fresh, ...linked];
  for (const f of readdirSync("data").filter((f) => /^gutenberg-all-\d+\.json$/.test(f))) rmSync(`data/${f}`);
  const tidy = (r: Row) => ({
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
  for (let i = 0; i < ordered.length; i += FILE_ROWS) {
    const file = `data/gutenberg-all-${files.length + 1}.json`;
    // One row per line: compact, and still readable in a diff.
    writeFileSync(file, `[\n${ordered.slice(i, i + FILE_ROWS).map((r) => JSON.stringify(tidy(r.row))).join(",\n")}\n]\n`);
    files.push(file);
  }

  // A seeded random sample of 50 new books for the spot-check.
  let seed = 20261026;
  const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const sample = [...fresh].map((r) => ({ r, k: rand() })).sort((a, b) => a.k - b.k).slice(0, 50).map((x) => x.r);
  writeFileSync(
    "data/.gutenberg-cache/spot-check-all-sample.json",
    JSON.stringify(
      sample.map((r) => ({
        id: r.c.book.id,
        title: r.row.title,
        category: r.row.category,
        description: r.row.description,
        translator: r.row.translator ?? null,
        authors: r.c.authors.map((p) => ({ name: p.agent.name, wikipedia: p.agent.wikipedia, year: p.year })),
        translators: r.c.translators.map((p) => ({ name: p.agent.name, wikipedia: p.agent.wikipedia, year: p.year })),
      })),
      null,
      2
    )
  );

  // ---- report ----
  const bytes = (s: string | null | undefined) => Buffer.byteLength(s ?? "", "utf8");
  const avg = (f: (r: Row) => number) => Math.round(fresh.reduce((n, r) => n + f(r.row), 0) / Math.max(1, fresh.length));
  const count = <T,>(xs: T[], key: (x: T) => string) => {
    const m = new Map<string, number>();
    for (const x of xs) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  const L: string[] = [];
  L.push("# Project Gutenberg, whole catalog — import report", "");
  L.push(
    `Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/gutenberg-all.ts\` from Gutenberg's official RDF catalog feed (downloaded 2026-10-16). Public-domain cutoff: died in **${PD_CUTOFF} or earlier**. For the large-file import on /admin/books, which marks these books as not curated.`,
    ""
  );
  L.push("## Totals", "", "| | Books |", "|---|---|");
  L.push(`| Gutenberg catalog | ${all.length} |`);
  L.push(`| Pass every rule | ${rows.length} |`);
  L.push(`| New books (${files.map((f) => `\`${f}\``).join(", ")}) | ${fresh.length} |`);
  L.push(`| Links for books already in the catalog (at the end of the last file) | ${linked.length} |`);
  L.push(`| Left to the curated import | ${inCurated} |`, "");
  L.push("## Left out, by rule", "", "| Rule | Books |", "|---|---|");
  for (const [k, v] of [...funnel].sort((a, b) => a[0].localeCompare(b[0]))) L.push(`| ${cell(k)} | ${v} |`);
  L.push("", "## New books by category", "", "| Category | Books |", "|---|---|");
  for (const [k, v] of count(fresh, (r) => r.row.category)) L.push(`| \`${k}\` | ${v} |`);
  L.push("", "## অন্যান্য (onnanno), by subject", "", "| Subject | Books |", "|---|---|");
  for (const [k, v] of count(fresh.filter((r) => r.row.category === OTHER), (r) => r.form.noun)) L.push(`| ${k} | ${v} |`);
  L.push("", "## Other facts", "");
  L.push(`- Translations, each crediting its translator: ${fresh.filter((r) => r.row.translator).length}.`);
  L.push(`- Volumes kept on their own (no complete set in the catalog): ${fresh.filter((r) => r.c.volume).length}.`);
  L.push(`- Authors and translators found on Wikidata with a death date: ${fresh.flatMap((r) => [...r.c.authors, ...r.c.translators]).filter((p) => p.facts?.death).length} of ${fresh.flatMap((r) => [...r.c.authors, ...r.c.translators]).length}.`);
  L.push(`- Average bytes per new row: title ${avg((r) => bytes(r.title))}, author ${avg((r) => bytes(r.author))}, description ${avg((r) => bytes(r.description))}, rights note ${avg((r) => bytes(r.sources[0].rightsBasis))}.`);
  L.push(`- Descriptions are neutral: author, original language, subject or form, translator; ${fresh.filter((r) => GUTENBERG_KNOWN[r.c.book.id]).length} well-known works keep the curated import's own line. No plot is described.`);
  L.push("", "## Spot-check", "", "See `data/gutenberg-all-spot-check.md` (`scripts/gutenberg-spot-check.ts --all`).");
  writeFileSync("data/gutenberg-all-report.md", L.join("\n") + "\n");
  console.log(`rows ${rows.length}: ${fresh.length} new + ${linked.length} links in ${files.join(", ")}; network calls ${networkCalls}`);
}

// Every book already in the catalog by title key; the author is checked by
// the caller. The dev database's books, then the import files'.
type CatalogBook = { title: string; titleBangla: string | null; author: string; category: string };
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
      for (const b of await prisma.book.findMany({ where: { curated: true }, select: { title: true, titleBangla: true, author: true, category: { select: { slug: true } } } }))
        add({ title: b.title, titleBangla: b.titleBangla, author: b.author, category: b.category.slug });
    } finally {
      await prisma.$disconnect();
    }
  }
  for (const f of ["data/catalog-import.json", ...readdirSync("data").filter((f) => /^(wikisource-import(-\d+)?|gutenberg-import-\d+)\.json$/.test(f)).map((f) => `data/${f}`)])
    if (existsSync(f))
      for (const b of JSON.parse(readFileSync(f, "utf8")) as { title: string; titleBangla?: string | null; author: string; category?: string }[])
        if (b.category) add({ title: b.title, titleBangla: b.titleBangla ?? null, author: b.author, category: b.category });
  return out;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
