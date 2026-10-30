import Link from "next/link";
import { readerHref } from "@/lib/wikisource/titles";

// The reader's page frame, shared by its sources (Wikisource and Project
// Gutenberg): the way back to the book page and the contents, and the
// book's name and byline.
export function ReaderShell({
  bookId,
  name,
  byline,
  heading = false,
  contentsLink = false,
  children,
}: {
  bookId: string;
  name: string;
  byline: string;
  heading?: boolean;
  contentsLink?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10" data-reader>
      <nav aria-label="বইয়ের পথ" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm">
        {/* On phones the top bar's back button goes to the book page. */}
        <Link href={`/books/${encodeURIComponent(bookId)}`} className="text-cloth hover:underline max-lg:hidden">
          ← বইয়ের পাতা
        </Link>
        {contentsLink && (
          <Link href={readerHref(bookId, "")} className="text-cloth hover:underline">
            সূচি
          </Link>
        )}
      </nav>
      {heading ? (
        <header className="mt-4">
          <h1 className="font-display text-3xl text-ink">{name}</h1>
          <p className="mt-1 font-body text-ink/70">{byline}</p>
        </header>
      ) : (
        <p className="mt-3 font-body text-sm text-ink/70">
          {name} · {byline}
        </p>
      )}
      {children}
    </div>
  );
}

// Cleaned on the server before it was stored -- by sanitizeWikisourceHtml
// (src/lib/wikisource/sanitize.ts) or parseGutenbergHtml
// (src/lib/gutenberg/parse.ts); nothing else is ever put here.
export function ReaderText({ html, lang = "bn" }: { html: string; lang?: string }) {
  return <div className="reader-text" lang={lang} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function StaleNote({ source }: { source: "wikisource" | "gutenberg" }) {
  return (
    <p className="mt-4 rounded-book bg-turmeric/15 px-3 py-2 font-body text-sm text-ink">
      {source === "wikisource"
        ? "উইকিসংকলনের সঙ্গে এখন যোগাযোগ করা যাচ্ছে না; কিছুদিন আগে আনা কপিটি দেখানো হচ্ছে।"
        : "প্রজেক্ট গুটেনবার্গ থেকে বইটির নতুন কপি এখন আনা যাচ্ছে না; আগে আনা কপিটি দেখানো হচ্ছে।"}
    </p>
  );
}
