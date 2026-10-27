// The language filter on the library, category pages and search (?lang=bn
// for Bangla, ?lang=other for every other language; nothing means all), the
// order books are listed in, and paging.

export type LanguageFilter = "all" | "bn" | "other";

export const LANGUAGE_FILTERS: { value: LanguageFilter; label: string }[] = [
  { value: "bn", label: "বাংলা" },
  { value: "other", label: "অন্যান্য ভাষা" },
  { value: "all", label: "সব" },
];

export function readLanguage(raw: string | string[] | undefined): LanguageFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "bn") return "bn";
  // "en" was the old English-only chip; links to it now show every language
  // that isn't Bangla, which includes English.
  if (value === "other" || value === "en") return "other";
  return "all";
}

// For the query string: "all" is the default, so it isn't written.
export const languageParam = (lang: LanguageFilter) => (lang === "all" ? undefined : lang);

// Book.language is the language code ("bn", "en", "ru", ...).
export function languageWhere(lang: LanguageFilter): { language?: string | { not: string } } {
  if (lang === "bn") return { language: "bn" };
  if (lang === "other") return { language: { not: "bn" } };
  return {};
}

// The same test as languageWhere, for a book already loaded.
export function inLanguage(language: string, lang: LanguageFilter): boolean {
  return lang === "all" || (lang === "bn") === (language === "bn");
}

// "No books in ..." messages: "বাংলা ভাষার" / "অন্য ভাষার".
export const languagePhrase = (lang: Exclude<LanguageFilter, "all">) => (lang === "bn" ? "বাংলা ভাষার" : "অন্য ভাষার");

type Listed = { language: string; title: string; titleBangla: string | null };

const banglaCollator = new Intl.Collator("bn");
const otherCollator = new Intl.Collator("en", { sensitivity: "base" });

// Bangla books first, by the title readers see (the Bangla one); then the
// rest by their English title -- some of those show a Bangla title, and
// mixing scripts in one alphabetical run would scatter them.
export function banglaFirst<T extends Listed>(books: T[]): T[] {
  // Leading quote marks and symbols (‘…’, ৺) don't decide the order.
  const shown = (b: Listed) => (b.titleBangla?.trim() || b.title).trim().replace(/^[^\p{L}\p{N}]+/u, "");
  const bangla = books.filter((b) => b.language === "bn").sort((a, b) => banglaCollator.compare(shown(a), shown(b)));
  const english = (b: Listed) => b.title.trim().replace(/^[^\p{L}\p{N}]+/u, "");
  const rest = books.filter((b) => b.language !== "bn").sort((a, b) => otherCollator.compare(english(a), english(b)));
  return [...bangla, ...rest];
}

// What the database orders the books imported in bulk by (Book.sortTitle),
// compared the way banglaFirst compares English titles: leading quote marks
// and symbols don't count, nor case or accents -- “Élan” is filed under e.
// Migration 20261027090000_book_sort_title mirrors this in SQL.
export function bookSortTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim()
    .toLowerCase();
}

export const PAGE_SIZE = 48;

export function readPage(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value > 1 ? value : 1;
}

// One page of a list made of the curated books (ordered here, by
// banglaFirst) followed by the rest (ordered and paged by the database): the
// curated books on the page, as [start, end) in their order, and how many of
// the rest to skip and take. A page past the end shows the last page.
export function splitPage(
  curatedCount: number,
  restCount: number,
  page: number,
  size = PAGE_SIZE
): { page: number; pages: number; curated: [number, number]; rest: { skip: number; take: number } } {
  const total = curatedCount + restCount;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  const end = Math.min(start + size, total);
  return {
    page: current,
    pages,
    curated: [Math.min(start, curatedCount), Math.min(end, curatedCount)],
    rest: { skip: Math.max(0, start - curatedCount), take: Math.max(0, end - Math.max(start, curatedCount)) },
  };
}

// One page of an ordered list; a page past the end shows the last page.
export function pageOf<T>(items: T[], page: number, size = PAGE_SIZE): { items: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages };
}
