// Rules and helpers shared by the Gutenberg imports (scripts/gutenberg-import.ts,
// the most downloaded thousand, and scripts/gutenberg-all.ts, the whole
// catalog): names, titles, editions, Bangla possessives and languages.
import type { Agent } from "./catalog";
import { possessive } from "../wikisource/descriptions";
import { normalizeForSearch } from "../../src/lib/search";

export const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
export const bnYear = (y: number) => (y < 0 ? `খ্রিস্টপূর্ব ${bnDigits(-y)}` : bnDigits(y));
// Built from code points so no invisible character sits in the source.
export const cp = (n: number) => String.fromCodePoint(n);
export const BANGLA = new RegExp(`[${cp(0x0980)}-${cp(0x09ff)}]`);
export const COMBINING = new RegExp(`[${cp(0x0300)}-${cp(0x036f)}]`, "g");
export const NOT_WORD = new RegExp(`[^a-z0-9${cp(0x0980)}-${cp(0x09ff)}]+`, "g");
// Possessive of a name or a list of names, by how the last one ends: a Latin
// name takes "-এর" ("Lucy Maud Montgomery-এর"); a Bangla one ending in
// ং takes "য়ের" ("কিপলিংয়ের"), in a hasanta "-এর", otherwise the usual
// "র"/"ের".
export const VIRAMA = cp(0x09cd);
export const ANUSVARA = cp(0x0982);
export function possessiveAny(name: string): string {
  const last = name.trim().split(/\s+/).pop() ?? name;
  if (!BANGLA.test(last)) return `${name.trim()}-এর`;
  const end = [...last].pop();
  if (end === ANUSVARA) return `${name.trim()}য়ের`;
  if (end === VIRAMA) return `${name.trim()}-এর`;
  return possessive(name);
}
export const listOf = (names: string[]) => (names.length <= 2 ? names.join(" ও ") : `${names.slice(0, -1).join(", ")} ও ${names[names.length - 1]}`);

// Wikidata language items -> Bangla names, for "the original language".
export const LANGUAGE_BN: Record<string, string> = {
  Q1860: "ইংরেজি", Q7737: "রুশ", Q150: "ফরাসি", Q188: "জার্মান", Q652: "ইতালীয়", Q1321: "স্প্যানিশ",
  Q35497: "প্রাচীন গ্রিক", Q397: "লাতিন", Q9027: "সুইডিশ", Q9035: "ড্যানিশ", Q9043: "নরওয়েজীয়", Q7411: "ডাচ",
  Q5146: "পর্তুগিজ", Q9288: "হিব্রু", Q11059: "সংস্কৃত", Q9610: "বাংলা", Q13955: "আরবি", Q9168: "ফারসি",
  Q7850: "চীনা", Q5287: "জাপানি", Q1412: "ফিনিশ", Q809: "পোলিশ", Q9056: "চেক", Q9067: "হাঙ্গেরীয়",
  Q36510: "প্রাচীন হিব্রু", Q8798: "ইউক্রেনীয়", Q256: "তুর্কি", Q36748: "প্রাচীন ইংরেজি", Q1568: "হিন্দি",
  Q1617: "উর্দু", Q9129: "আধুনিক গ্রিক", Q12107: "ব্রেটন", Q9192: "ম্যান্ডারিন"
};

// LCC literature classes outside English and American: a book there
// without Wikidata about its author is taken to be a translation.
export const FOREIGN_LCC = /^(PA|PB|PC|PD|PF|PG|PH|PJ|PK|PL|PM|PQ|PT)/;
export const TEXT_ROLES: Record<string, string> = { edt: "editor", com: "commentator", cmm: "commentator", aui: "author of the introduction", aft: "author of the afterword", ann: "annotator", ctb: "contributor", adp: "adapter" };
export const IMAGE_ROLES: Record<string, string> = { ill: "illustrator", pht: "photographer", art: "artist", egr: "engraver" };

export const VOLUME = /\b(vol(ume)?\.?|v\.)\s*([0-9]+|[ivxlc]+)\b|\(of \d+\)|\bpart\s+([0-9]+|[ivxlc]+|one|two|three)\b|—\s*volume|\bbook\s+([0-9]+|[ivxlc]+)\s+of\b/i;

// "Shelley, Mary Wollstonecraft" -> "Mary Wollstonecraft Shelley";
// "Forster, E. M. (Edward Morgan)" -> "E. M. Forster".
export function displayName(a: Agent): string {
  const name = a.name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const parts = name.split(/,\s*/);
  if (parts.length < 2) return name;
  const [last, first] = parts;
  if (/^(graf|count|sir|lord|baron|emperor|king|queen|saint|st\.|duke|earl|of|the)\b/i.test(first)) return last;
  return `${first} ${last}`.trim();
}

export const SMALL = new Set(["a", "an", "and", "the", "of", "in", "on", "at", "to", "for", "or", "nor", "but", "by", "with", "from", "into", "as", "vs", "de", "von", "van", "du", "der"]);
// Gutenberg sometimes catalogues titles in sentence case ("The strange case
// of Dr. Jekyll and Mr. Hyde"); give those the usual title case.
export function titleCase(t: string): string {
  const words = t.split(" ");
  const lowerCount = words.slice(1).filter((w) => /^[a-z]/.test(w) && !SMALL.has(w)).length;
  if (lowerCount < 1) return t;
  return words.map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : /^d'/.test(w) ? w : w.replace(/^[a-z]/, (c) => c.toUpperCase()))).join(" ");
}
// The main title: before a subtitle (";", ":", "Or,", " — ") and without
// ", Complete"; very long ones are cut at a comma.
export function mainTitle(t: string): string {
  let first = t.split(/\s*[;:]\s+|\s+—\s+|,?\s+or,\s+/i)[0].replace(/,?\s*complete\.?$/i, "").trim();
  if (first.length < 2) first = t;
  if (first.length > 150) first = first.slice(0, first.indexOf(", ", 20) > 0 ? first.indexOf(", ", 20) : 150).trim();
  return titleCase(first);
}

export const loose = (s: string) =>
  normalizeForSearch(s)
    .normalize("NFKD")
    .replace(COMBINING, "")
    .replace(/^(the|a|an)\s+/, "")
    .replace(NOT_WORD, "");
export const surname = (author: string) => loose(author.split(/\s+/).pop() ?? author);

// For finding a book already in the catalog: titles compared without
// articles, "of" or "and", with "Dr." as "Doctor" ("The Sign of Four" is "The
// Sign of the Four"; "The Island of Dr Moreau" is "...of Doctor Moreau").
export const matchKey = (t: string) =>
  loose(
    t
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\bdr\b\.?/g, "doctor")
      .replace(/\bst\b\.?/g, "saint")
      .replace(/\b(the|a|an|of|and)\b/g, " ")
  );
// One title contains the other, compared as matchKey does.
export function sameTitle(gutenberg: string, wikidata: string): boolean {
  const a = matchKey(mainTitle(gutenberg));
  const b = matchKey(wikidata);
  return a.length > 0 && b.length > 0 && (a.includes(b) || b.includes(a));
}
export function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// A work's title for telling editions apart: without a translator's name
// ("Divine Comedy, Longfellow's Translation, Hell"), without "of <author>"
// ("The Odyssey of Homer"), and singular ("The Odysseys of Homer").
export const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function workTitle(title: string, authorNames: string[]): string {
  let t = mainTitle(title).replace(/,\s*[^,]*['’]s translation\b.*$/i, "");
  for (const name of authorNames) {
    const last = name.split(/\s+/).pop() ?? "";
    if (last.length > 2) t = t.replace(new RegExp(`\\s+of\\s+${escapeRe(last)}\\b.*$`, "i"), "");
  }
  return matchKey(t).replace(/s$/, "");
}
// Surnames spelt differently across sources: Dostoyevsky / Dostoevsky.
export const sameSurname = (a: string, b: string) => a === b || (a.length >= 5 && b.length >= 5 && editDistance(a, b) <= 2);

// An author the catalog already has keeps the catalog's spelling ("Fyodor
// Dostoevsky", not "Dostoyevsky") -- when it is the same person: the same
// first name, a surname at most one letter apart, and the same death year.
// Anything looser picks other people: Roy Norton is not Robert Burton, nor
// Mrs. Beeton Isaac Newton, nor William Henry Hudson (died 1918) William
// Hope Hodgson (died 1918).
// Whether Wikidata's item for a Wikipedia page Gutenberg gives a person is
// that person: a word of their family name as Gutenberg files it ("Pu" in
// "Pu, Songling", "Napoleon" in "Napoleon I, Emperor of the French"), or one
// letter off in a long word (Afanasʹev / Afanasyev), is a word of the item's
// name or of the page's title, leaving out a peerage ("…, 1st Baron Acton");
// and neither is a family or a title ("Young baronets of Dominica",
// "Marquess of Salisbury"). Gutenberg links some people to the wrong page
// (Jules Remy to Oscar Straus); only the person's own item settles their
// death year and name. Where Gutenberg's form is too unlike Wikidata's to
// tell (Zhuangzi / Zhuang Zhou), the item counts as someone else's.
const NAME_STOP = new Set(["of", "the", "de", "da", "di", "du", "la", "le", "von", "van", "der", "den", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]);
const nameWords = (s: string) =>
  normalizeForSearch(s)
    .normalize("NFKD")
    .replace(COMBINING, "")
    .split(/[^a-zÀ-ɏ]+/)
    .filter((w) => w.length >= 2 && !NAME_STOP.has(w));
const NOT_A_PERSON = /\bbaronets?\b|\bfamily\b|\bdynasty\b|\b(marquess|marquis|earl|duke|baron|viscount|house|kings?|counts?) of\b|\(\d{4}\)/i;
export function wikidataIsPerson(a: Agent, nameEn: string | null, pageUrl: string): boolean {
  const family = [a.name, ...a.aliases].flatMap((n) => nameWords(n.split(",")[0]));
  const page = decodeURIComponent(pageUrl.split("/wiki/")[1] ?? "").replace(/_/g, " ");
  return [nameEn, page].some((n) => {
    if (!n || NOT_A_PERSON.test(n.split(",")[0])) return false;
    const words = nameWords(n.replace(/,\s*\d+(st|nd|rd|th)\s.*$/i, ""));
    return family.some((f) => words.some((w) => w === f || (f.length >= 6 && w.length >= 6 && editDistance(f, w) <= 1) || (f.length >= 5 && w.includes(f))));
  });
}

export type KnownAuthor = { name: string; death: number | null };
// The catalog's single authors writing in Latin script, with their death
// years (a book by several authors has only the latest).
export const knownAuthors = (books: { author: string; authorDeathYear: number | null }[]): KnownAuthor[] => [
  ...new Map(books.filter((b) => !BANGLA.test(b.author) && !/,|\sও\s/.test(b.author)).map((b) => [b.author, { name: b.author, death: b.authorDeathYear }])).values(),
];
export function catalogSpelling(name: string, death: number | null, known: KnownAuthor[]): string {
  const first = (n: string) => n.split(/\s+/)[0].toLowerCase();
  if (death === null || first(name).length < 2 || first(name).endsWith(".")) return name;
  return (
    known.find((a) => a.name !== name && a.death === death && first(a.name) === first(name) && editDistance(surname(a.name), surname(name)) <= 1)?.name ?? name
  );
}
