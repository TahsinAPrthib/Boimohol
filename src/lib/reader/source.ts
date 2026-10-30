import { canBePublicDomain } from "@/lib/public-domain";
import { workRootFromUrl } from "@/lib/wikisource/titles";
import { gutenbergEbookId, readableHere } from "@/lib/gutenberg/source";

// Where the in-site reader takes a book's text from, if it can read the book
// at all: its Bangla Wikisource work (src/lib/wikisource/), else its Project
// Gutenberg ebook (src/lib/gutenberg/) -- the latter only once the texts
// database is configured (TEXTS_DATABASE_URL) and not for link-only books.
// Either way only for a book that passes the public-domain rule today, the
// same rule as every free copy on the site.
export type ReaderSource = { kind: "wikisource"; root: string; url: string } | { kind: "gutenberg"; ebookId: number; url: string };

export function readerSource(book: {
  isPublicDomain: boolean;
  authorDeathYear: number | null;
  sources: { kind: string; url: string }[];
}): ReaderSource | null {
  if (!book.isPublicDomain || !canBePublicDomain(book.authorDeathYear)) return null;
  for (const s of book.sources) {
    if (s.kind !== "WIKISOURCE") continue;
    const root = workRootFromUrl(s.url);
    if (root) return { kind: "wikisource", root, url: s.url };
  }
  if (!process.env.TEXTS_DATABASE_URL) return null;
  for (const s of book.sources) {
    if (s.kind !== "GUTENBERG") continue;
    const ebookId = gutenbergEbookId(s.url);
    if (ebookId !== null && readableHere(ebookId)) return { kind: "gutenberg", ebookId, url: s.url };
  }
  return null;
}
