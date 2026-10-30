import lists from "./lists.json";

// Which Gutenberg books the in-site reader shows: any book the catalog links
// to Gutenberg, except the link-only ones (lists.json, from
// scripts/gutenberg-reader-lists.ts): no HTML version, picture books, and
// the very large books outside the 1,000 stored ahead of time.

const LINK_ONLY = new Set<number>(lists.linkOnly);

// "https://www.gutenberg.org/ebooks/1342" -> 1342 (the landing page, the
// only Gutenberg address the catalog stores).
export function gutenbergEbookId(url: string): number | null {
  const m = url.match(/^https:\/\/www\.gutenberg\.org\/ebooks\/(\d{1,6})$/);
  return m ? Number(m[1]) : null;
}

export const readableHere = (ebookId: number) => !LINK_ONLY.has(ebookId);

export const gutenbergLanding = (ebookId: number) => `https://www.gutenberg.org/ebooks/${ebookId}`;
