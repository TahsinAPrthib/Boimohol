import { notFound } from "next/navigation";
import { loadBook } from "@/lib/loaders";
import { readerSource } from "@/lib/reader/source";
import { loadContents } from "@/lib/wikisource/reader";
import { loadGutenbergContents } from "@/lib/gutenberg/reader";
import { pathFromSegments } from "@/lib/wikisource/titles";

// Above the reader's loading skeleton, so an address that can't name a page,
// or names a page that isn't part of the work, is a real 404. That takes
// the work's contents: from the cache, or fetched here the first time --
// the page reuses them (loadContents and loadGutenbergContents run once per
// request). Only when the source can't be reached and nothing is stored does
// the page decide, and it shows that message instead.
export default async function ChapterLayout(props: { children: React.ReactNode; params: Promise<{ id: string; chapter?: string[] }> }) {
  const { id, chapter } = await props.params;
  const path = pathFromSegments(chapter ?? []);
  if (path === null) notFound();
  if (path) {
    const book = await loadBook(id);
    const source = book ? readerSource(book) : null;
    if (!book || !source) notFound();
    if (source.kind === "wikisource") {
      const contents = await loadContents(book.id, source.root);
      if (contents.ok && !contents.value.entries.some((e) => e.path === path)) notFound();
    } else {
      // A Gutenberg book's chapters are numbered from 1.
      if (!/^[1-9]\d{0,4}$/.test(path)) notFound();
      const contents = await loadGutenbergContents(book.id, source.ebookId);
      if (contents.ok && Number(path) > contents.value.entries.length) notFound();
    }
  }
  return props.children;
}
