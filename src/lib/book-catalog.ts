// Pure helpers for adding books: duplicate detection and id generation.
// Shared by the admin form and the bulk import so both refuse the same things.

type Named = { title: string; titleBangla?: string | null; author: string };

// Case-insensitive, whitespace-insensitive, and Unicode-normalised: Bangla
// letters such as য় can be stored as one code point or as য + nukta, which
// look identical but would otherwise compare unequal.
export function normalizeForMatch(text: string): string {
  return text.normalize("NFC").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

// A book is identified by its author plus either of its titles, so a new
// book clashes with an existing one when the author matches and any of its
// titles (English or Bangla) equals any of the other's.
export function bookKeys(book: Named): string[] {
  const author = normalizeForMatch(book.author);
  const titles = [book.title, book.titleBangla].filter((t): t is string => !!t && t.trim() !== "");
  return [...new Set(titles.map((t) => `${author}\u0000${normalizeForMatch(t)}`))];
}

export function keySetOf(books: Named[]): Set<string> {
  const keys = new Set<string>();
  for (const b of books) for (const k of bookKeys(b)) keys.add(k);
  return keys;
}

export function clashesWith(book: Named, keys: Set<string>): boolean {
  return bookKeys(book).some((k) => keys.has(k));
}

// The same matching, but answering *which* existing book: for an import row
// that only adds a link to a book already in the catalog. If two books share
// a key the first one listed wins.
export function indexByKeys<T extends Named>(books: T[]): Map<string, T> {
  const index = new Map<string, T>();
  for (const b of books) for (const k of bookKeys(b)) if (!index.has(k)) index.set(k, b);
  return index;
}

export function findExisting<T extends Named>(book: Named, index: Map<string, T>): T | undefined {
  for (const k of bookKeys(book)) {
    const hit = index.get(k);
    if (hit) return hit;
  }
  return undefined;
}

// Same shape as the seed's ids (category slug + title), but limited to URL-safe
// characters. A clash with an existing id gets -2, -3, ...
export function bookIdFor(categorySlug: string, title: string, taken: Set<string>): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  const base = `${categorySlug}-${slug || "book"}`;
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}
