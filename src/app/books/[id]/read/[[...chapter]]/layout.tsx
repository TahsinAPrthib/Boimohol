import { notFound } from "next/navigation";
import { loadBook } from "@/lib/loaders";
import { cachedContents, readerSource } from "@/lib/wikisource/reader";
import { pathFromSegments } from "@/lib/wikisource/titles";

// Above the reader's loading skeleton: an address that can't name a page,
// or a page that isn't part of the work, is a real 404 -- when the work's
// contents are already cached. (When they aren't, the page itself finds
// out once it has fetched them, after the skeleton has been sent.)
export default async function ChapterLayout(props: { children: React.ReactNode; params: Promise<{ id: string; chapter?: string[] }> }) {
  const { id, chapter } = await props.params;
  const path = pathFromSegments(chapter ?? []);
  if (path === null) notFound();
  if (path) {
    const book = await loadBook(id);
    const source = book ? readerSource(book) : null;
    const contents = book && source ? await cachedContents(book.id, source.root) : null;
    if (contents && !contents.entries.some((e) => e.path === path)) notFound();
  }
  return props.children;
}
