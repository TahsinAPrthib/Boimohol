import { notFound } from "next/navigation";
import { loadBook } from "@/lib/loaders";
import { readerSource } from "@/lib/wikisource/reader";

// Above the reader's loading skeleton, so a book that can't be read here
// (no Wikisource copy, or not public domain) is a real 404.
export default async function ReaderLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const book = await loadBook(id);
  if (!book || !readerSource(book)) notFound();
  return props.children;
}
