// The language filter on the library, category pages and search (?lang=bn or
// ?lang=en; nothing means all), the order books are listed in, and paging.

export type LanguageFilter = "all" | "bn" | "en";

export const LANGUAGE_FILTERS: { value: LanguageFilter; label: string }[] = [
  { value: "all", label: "সব" },
  { value: "bn", label: "বাংলা" },
  { value: "en", label: "ইংরেজি" },
];

export function readLanguage(raw: string | string[] | undefined): LanguageFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "bn" || value === "en" ? value : "all";
}

// For the query string: "all" is the default, so it isn't written.
export const languageParam = (lang: LanguageFilter) => (lang === "all" ? undefined : lang);

// Book.language is the language code ("bn", "en", "ru", ...); "all" adds no
// condition, so books in other languages still appear there.
export function languageWhere(lang: LanguageFilter): { language?: string } {
  return lang === "all" ? {} : { language: lang };
}

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

export const PAGE_SIZE = 48;

export function readPage(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value > 1 ? value : 1;
}

// One page of an ordered list; a page past the end shows the last page.
export function pageOf<T>(items: T[], page: number, size = PAGE_SIZE): { items: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages };
}
