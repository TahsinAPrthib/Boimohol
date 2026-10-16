// Site search. Every searchable row stores a precomputed `searchText`, built
// here, and every query goes through the same normalization, so a Bangla word
// typed on a different keyboard still matches.
//
// The SQL backfill in prisma/migrations/*_add_search_text mirrors
// normalizeForSearch step for step; change both together.
//
// Invisible and combining characters are written as code points (cp(...)),
// never as literal characters, so they stay visible and can't be altered by
// an editor.

export const MAX_QUERY_LENGTH = 100;

const cp = (...codes: number[]) => String.fromCodePoint(...codes);
const ZWJ = cp(0x200d);

// ত্ + ZWJ is the pre-Unicode-4.1 way to write khanda ta; ৎ (U+09CE) is the
// modern one.
const KHANDA_TA_OLD = new RegExp(cp(0x09a4, 0x09cd) + ZWJ, "g");
const KHANDA_TA = cp(0x09ce);
// Zero-width space, non-joiner and joiner (U+200B-U+200D), word joiner
// (U+2060) and BOM (U+FEFF): invisible, left behind by keyboards or copy-paste.
const ZERO_WIDTH = new RegExp(`[${cp(0x200b)}-${cp(0x200d)}${cp(0x2060)}${cp(0xfeff)}]`, "g");
// Whitespace, spelled out rather than \s so the SQL version uses the
// identical set: tab, LF, VT, FF, CR, space, no-break spaces and the other
// Unicode spaces.
const SPACE_CHARS = [0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20, 0xa0, 0x1680, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000];
const SPACES = new RegExp(`[${cp(...SPACE_CHARS)}${cp(0x2000)}-${cp(0x200a)}]+`, "g");

export function normalizeForSearch(text: string | null | undefined): string {
  if (!text) return "";
  return (
    text
      .normalize("NFC")
      .replace(KHANDA_TA_OLD, KHANDA_TA)
      .replace(ZERO_WIDTH, "")
      // Again: removing a joiner can bring two parts of a vowel sign together.
      .normalize("NFC")
      .toLowerCase()
      .replace(SPACES, " ")
      .trim()
  );
}

// Fields are joined with a newline, which a normalized query never contains,
// so a match can't run from the end of one field into the next.
function combine(parts: (string | null | undefined)[]): string {
  return parts.map(normalizeForSearch).filter(Boolean).join("\n");
}

// The translator and the hidden aliases are searchable too: a Bangla-script
// search for "প্রাইড অ্যান্ড প্রেজুডিস" finds Pride and Prejudice.
export function bookSearchText(book: {
  title: string;
  titleBangla?: string | null;
  author: string;
  translator?: string | null;
  searchAliases?: string[] | null;
}): string {
  return combine([book.title, book.titleBangla, book.author, book.translator, ...(book.searchAliases ?? [])]);
}

export function listingSearchText(listing: { title: string; author: string; location: string }): string {
  return combine([listing.title, listing.author, listing.location]);
}

export function requestSearchText(request: { title: string; author: string }): string {
  return combine([request.title, request.author]);
}

// The ?q= value as typed: one value, trimmed, at most MAX_QUERY_LENGTH.
export function readQuery(value: string | string[] | undefined): string {
  const first = Array.isArray(value) ? value[0] : value;
  return (first ?? "").trim().slice(0, MAX_QUERY_LENGTH).trim();
}

// LIKE treats % and _ as wildcards and \ as its escape; the query means them
// literally. (Prisma's `contains` does not escape them itself.)
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => "\\" + c);
}

// How well a row's fields answer the query, for ordering results: 0 when a
// field is exactly the query, 1 when one starts with it, 2 when a word in one
// starts with it, 3 for a match anywhere else.
export function matchRank(fields: (string | null | undefined)[], query: string): number {
  const q = normalizeForSearch(query);
  let best = 3;
  for (const field of fields.map(normalizeForSearch)) {
    if (!field || !q) continue;
    if (field === q) return 0;
    if (field.startsWith(q)) best = Math.min(best, 1);
    else if (field.includes(" " + q)) best = Math.min(best, 2);
  }
  return best;
}

// A link to `path` carrying the given parameters, empty ones left out -- used
// so a category chip keeps the search, and the search keeps the category.
export function hrefWith(path: string, params: Record<string, string | null | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

// Prisma filter for a query, or undefined when there is nothing to search for
// (the page then shows its normal content).
export function searchFilter(query: string): { searchText: { contains: string } } | undefined {
  const normalized = normalizeForSearch(query);
  return normalized ? { searchText: { contains: escapeLike(normalized) } } : undefined;
}
