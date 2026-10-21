import { notFound } from "next/navigation";
import { loadBook } from "@/lib/loaders";
import { loadContents, readerSource } from "@/lib/wikisource/reader";
import { pathFromSegments } from "@/lib/wikisource/titles";

// Above the reader's loading skeleton, so an address that can't name a page,
// or names a page that isn't part of the work, is a real 404. That takes
// the work's contents: from the cache, or fetched here the first time --
// the page reuses them (loadContents runs once per request). Only when
// Wikisource can't be reached and nothing is cached does the page decide,
// and it shows that message instead.
export default async function ChapterLayout(props: { children: React.ReactNode; params: Promise<{ id: string; chapter?: string[] }> }) {
  const { id, chapter } = await props.params;
  const path = pathFromSegments(chapter ?? []);
  if (path === null) notFound();
  if (path) {
    const book = await loadBook(id);
    const source = book ? readerSource(book) : null;
    if (!book || !source) notFound();
    const contents = await loadContents(book.id, source.root);
    if (contents.ok && !contents.value.entries.some((e) => e.path === path)) notFound();
  }
  return props.children;
}
