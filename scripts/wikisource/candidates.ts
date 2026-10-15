// Stage 2b: turn each complete scan into a candidate book, and decide on
// Wikidata's evidence alone whether it can be public domain.
import type { IndexPage } from "./indexes";
import { deathOf, earliestYear, getEntities, itemIds, label, Q, strings, type Entity } from "./wikidata";
import { toLatinDigits } from "./verify";
import { CONFIRMED_DEATHS } from "./death-years";

export const PD_CUTOFF = new Date().getUTCFullYear() - 61; // died in this year or earlier

export type Person = {
  id: string;
  nameBn: string | null;
  nameEn: string | null;
  deathYear: number | null;
  human: boolean;
  // Languages they wrote in (P1412), when Wikidata records them.
  writes: string[];
  era?: string; // set when the death year is an era from death-years.ts
  deathText?: string; // "১৯৪১ সালে", "আনুমানিক ১২৪৫ সালে", "৭ম শতকে" (from Wikidata)
};

export type Candidate = {
  index: IndexPage;
  editionId: string | null;
  workId: string | null; // the work item, or the edition itself when it has no "edition of"
  titleBn: string | null;
  titleEn: string | null;
  mainPage: string | null; // bn.wikisource title of the work's main page
  authors: Person[];
  translators: Person[];
  editors: Person[];
  languages: string[];
  publishYear: number | null;
  wikidataTypes: string[];
  translation: boolean;
  editionYear: number | null; // when the scanned edition was printed
  excluded?: string; // why it can't be imported
};

const NOT_A_BOOK_CATEGORIES = [/গেজেট/, /চলচ্চিত্র প্রচার পুস্তিকা/, /জাতিসংঘ/, /সাময়িক/, /পত্রিকা/, /সংবিধান/, /আইন/];
const NOT_A_BOOK_TYPES = new Set([
  "Q28869365", // issue (of a periodical)
  "Q41298", // magazine
  "Q1002697", // periodical literature
  "Q11032", // newspaper
  "Q2334719", // legal case
  "Q820655", // statute
  "Q7748", // law
]);
const TRANSLATION_CATEGORIES = [/অনুবাদ সাহিত্য/, /অনূদিত/];

// Wikidata's death year; failing that, one a person confirmed from another
// source (death-years.ts), with the era the rights note should give.
function person(e: Entity | undefined, id: string): Person {
  const death = deathOf(e);
  const confirmed = death ? undefined : CONFIRMED_DEATHS[id];
  return {
    id,
    nameBn: label(e, "bn"),
    nameEn: label(e, "en"),
    deathYear: death?.year ?? confirmed?.year ?? null,
    deathText: death?.text,
    era: confirmed?.era,
    human: itemIds(e, "P31").includes(Q.human),
    writes: itemIds(e, "P1412"),
  };
}

// Whether every person in the list died in or before the cutoff year; the
// reason when not.
function allPublicDomain(people: Person[], role: string): string | null {
  for (const p of people) {
    const name = p.nameBn ?? p.nameEn ?? p.id;
    if (p.deathYear === null) return `${role}'s death year is not on Wikidata (${name})`;
    if (p.deathYear > PD_CUTOFF) return `${role} died in ${p.deathYear}, after ${PD_CUTOFF} (${name})`;
  }
  return null;
}

// The scanned edition's year: Wikidata's, else Wikisource's automatic
// "১৯৩৮ খ্রিস্টাব্দে প্রকাশিত" category, else the index's Year field.
function editionYearOf(edition: Entity | undefined, index: IndexPage): number | null {
  const fromWikidata = earliestYear(edition, "P577");
  if (fromWikidata !== null) return fromWikidata;
  const category = index.categories.find((c) => /খ্রিস্টাব্দে প্রকাশিত/.test(c));
  const m = toLatinDigits(category ?? index.fields.Year ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

export async function buildCandidates(indexes: IndexPage[]): Promise<Candidate[]> {
  const editionIds = indexes.map((i) => i.fields.wikidata_item ?? "").filter((x) => /^Q\d+$/.test(x));
  const editions = await getEntities(editionIds);
  const workIds = [...editions.values()].flatMap((e) => itemIds(e, "P629")).filter((x) => x !== "?");
  const works = await getEntities(workIds);
  const both = (e: Entity | undefined, w: Entity | undefined, p: string) => (itemIds(e, p).length ? itemIds(e, p) : itemIds(w, p));
  const personIds = [...editions.values()].flatMap((e) => {
    const w = works.get(itemIds(e, "P629")[0] ?? "");
    return [...both(e, w, "P50"), ...itemIds(e, "P655"), ...itemIds(e, "P98")];
  });
  const people = await getEntities(personIds.filter((x) => x !== "?"));

  return indexes.map((index) => {
    const editionId = /^Q\d+$/.test(index.fields.wikidata_item ?? "") ? index.fields.wikidata_item : null;
    const edition = editionId ? editions.get(editionId) : undefined;
    const workRef = itemIds(edition, "P629").find((x) => x !== "?");
    const work = workRef ? works.get(workRef) : undefined;
    const authorIds = both(edition, work, "P50");
    const c: Candidate = {
      index,
      editionId,
      workId: workRef ?? editionId,
      titleBn: label(work, "bn") ?? label(edition, "bn") ?? strings(edition, "P1476")[0] ?? null,
      titleEn: label(work, "en") ?? label(edition, "en"),
      mainPage: edition?.sitelinks?.bnwikisource?.title ?? work?.sitelinks?.bnwikisource?.title ?? null,
      authors: authorIds.filter((x) => x !== "?").map((id) => person(people.get(id), id)),
      translators: itemIds(edition, "P655").filter((x) => x !== "?").map((id) => person(people.get(id), id)),
      editors: itemIds(edition, "P98").filter((x) => x !== "?").map((id) => person(people.get(id), id)),
      languages: itemIds(edition, "P407"),
      publishYear: earliestYear(work, "P577"),
      wikidataTypes: [...new Set([...itemIds(edition, "P31"), ...itemIds(work, "P31"), ...itemIds(work, "P136"), ...itemIds(edition, "P136")])],
      translation: false,
      editionYear: editionYearOf(edition, index),
    };

    const cats = index.categories;
    // A Bangla text by someone who, per Wikidata, didn't write in Bangla
    // (Tolstoy, Gandhi, Aesop ...) is a translation even when nothing says so.
    const foreignAuthor = c.authors.some((a) => a.writes.length > 0 && !a.writes.includes(Q.bengali));
    const isTranslation =
      foreignAuthor ||
      c.translators.length > 0 ||
      itemIds(edition, "P655").includes("?") ||
      cats.some((cat) => TRANSLATION_CATEGORIES.some((re) => re.test(cat))) ||
      (itemIds(work, "P407").length > 0 && !itemIds(work, "P407").includes(Q.bengali));
    c.translation = isTranslation;

    c.excluded =
      (!edition && "the scan has no Wikidata item") ||
      ((c.languages.length > 0 && !c.languages.includes(Q.bengali)) || (index.fields.Language && index.fields.Language !== "bn")
        ? `not in Bangla (Wikisource language: ${index.fields.Language || "?"}; Wikidata: ${c.languages.join(", ") || "-"})`
        : "") ||
      (cats.some((cat) => NOT_A_BOOK_CATEGORIES.some((re) => re.test(cat))) || c.wikidataTypes.some((t) => NOT_A_BOOK_TYPES.has(t))
        ? "not a literary book (gazette, legal or UN document, film booklet or periodical)"
        : "") ||
      (authorIds.includes("?") || authorIds.includes(Q.anonymous) || cats.some((cat) => /অজ্ঞাত লেখক রচিত/.test(cat)) || authorIds.length === 0
        ? "anonymous, or no author on Wikidata"
        : "") ||
      (c.authors.some((a) => !a.human) ? "author is an organisation, not a person" : "") ||
      allPublicDomain(c.authors, "author") ||
      (isTranslation && c.translators.length === 0 ? "translation with no named translator" : "") ||
      (c.translators.length ? allPublicDomain(c.translators, "translator") : null) ||
      (itemIds(edition, "P98").includes("?") ? "editor unknown" : "") ||
      (c.editors.length ? allPublicDomain(c.editors, "editor") : null) ||
      (!c.mainPage ? "no main Wikisource page linked from Wikidata" : "") ||
      undefined;
    return c;
  });
}
