// The home page's "পাঠকদের তাকে সবচেয়ে বেশি": the books on the most readers'
// shelves. A book counts once MIN_READERS different readers have shelved it
// (admins' shelves don't count: those accounts test the site), and the
// section appears only once MIN_BOOKS books count, so a handful of shelves
// can't make it. The query is in src/components/HomeSections.tsx.

export const MIN_READERS = 3;
export const MIN_BOOKS = 4;
export const SHOWN = 6;

// `ranked`: the counting books' ids, most shelved first. Curated books come
// before the ones imported in bulk from a whole catalog.
export function mostShelved<B extends { id: string; curated: boolean }>(ranked: string[], books: B[]): B[] {
  const byId = new Map(books.map((b) => [b.id, b]));
  const popular = ranked.map((id) => byId.get(id)).filter((b): b is B => b !== undefined);
  if (popular.length < MIN_BOOKS) return [];
  return [...popular.filter((b) => b.curated), ...popular.filter((b) => !b.curated)].slice(0, SHOWN);
}
