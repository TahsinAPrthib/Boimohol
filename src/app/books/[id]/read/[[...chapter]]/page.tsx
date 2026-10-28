import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { loadBook } from "@/lib/loaders";
import { getChapter, loadContents, readerSource, type TocEntry } from "@/lib/wikisource/reader";
import { READER_SIZE_COOKIE, readSizeStep } from "@/lib/wikisource/reader-prefs";
import { pathFromSegments, readerHref, titleInWork, wikisourceUrl } from "@/lib/wikisource/titles";
import ReaderFrame from "@/components/reader/ReaderFrame";
import ReaderProgress from "@/components/reader/ReaderProgress";
import ResumeReading from "@/components/reader/ResumeReading";
import { ReaderAttribution, ReaderNav, ReaderToc, ReaderUnavailable, ScanLinks, shortLabel } from "@/components/reader/ReaderParts";

type Props = {
  params: Promise<{ id: string; chapter?: string[] }>;
  searchParams: Promise<{ resume?: string | string[] }>;
};

// /books/[id]/read is the work's contents (and its main page's text: the
// whole text, for a work on a single page); /books/[id]/read/<path> is one of
// its pages. Text is fetched from Wikisource and cleaned on the server
// (src/lib/wikisource/).

const loadReader = cache(async (id: string) => {
  const book = await loadBook(id);
  const source = book ? readerSource(book) : null;
  return book && source ? { book, source } : null;
});

const NOT_FOUND_TITLE = "পাতাটি পাওয়া যায়নি · বই মহল";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id, chapter } = await props.params;
  const reader = await loadReader(id);
  if (!reader) return {};
  // Wikisource is the place for search engines to find the text; here it
  // is a reading view, and crawling it would only fetch from Wikisource.
  const robots = { index: false, follow: false };
  const name = reader.book.titleBangla || reader.book.title;
  const path = pathFromSegments(chapter ?? []);
  // The layouts answer these with the not-found page; its title, too.
  if (path === null) return { title: NOT_FOUND_TITLE, robots };
  let label = "";
  if (path) {
    const contents = await loadContents(reader.book.id, reader.source.root);
    const entry = contents.ok ? contents.value.entries.find((e) => e.path === path) : undefined;
    if (contents.ok && !entry) return { title: NOT_FOUND_TITLE, robots };
    label = entry?.label ?? "";
  }
  return { title: `${label ? `${label} — ` : ""}${name} · বই মহলে পড়ুন`, robots };
}

export default async function ReaderPage(props: Props) {
  const { id, chapter } = await props.params;
  const { resume } = await props.searchParams;
  const reader = await loadReader(id);
  if (!reader) notFound();
  const { book, source } = reader;
  const path = pathFromSegments(chapter ?? []);
  if (path === null) notFound();

  const [userId, cookieStore] = await Promise.all([getSessionUserId(), cookies()]);
  const sizeStep = readSizeStep(cookieStore.get(READER_SIZE_COOKIE)?.value);
  const name = book.titleBangla || book.title;
  const byline = `${book.author}${book.translator ? ` · অনুবাদ: ${book.translator}` : ""}`;

  const contents = await loadContents(book.id, source.root);
  if (!contents.ok) {
    return (
      <Shell bookId={book.id} name={name} byline={byline} heading>
        <ReaderUnavailable href={source.url} missing={contents.reason === "missing"} />
      </Shell>
    );
  }
  const { root, entries, frontHtml, frontTextLength, scans } = contents.value;
  const saved = userId
    ? await prisma.readingPosition.findUnique({ where: { userId_bookId: { userId, bookId: book.id } }, select: { chapter: true, progress: true } })
    : null;
  const labelOf = (p: string) => entries.find((e) => e.path === p)?.label ?? "";
  const resuming = resume === "1";

  // ---- the contents page ----
  if (path === "") {
    const singlePage = entries.length === 0;
    return (
      <Shell bookId={book.id} name={name} byline={byline} heading>
        {contents.stale && <StaleNote />}
        <ResumeReading
          bookId={book.id}
          signedIn={Boolean(userId)}
          saved={saved ? { chapter: saved.chapter, label: labelOf(saved.chapter), progress: saved.progress } : null}
          startHref={singlePage ? null : readerHref(book.id, entries[0].path)}
          singlePage={singlePage}
        />
        <ScanLinks scans={scans} />
        {!singlePage && (
          <section className="mt-10" aria-labelledby="toc-heading">
            <h2 id="toc-heading" className="font-display text-2xl text-ink">
              সূচি
            </h2>
            <div className="mt-3">
              <ReaderToc bookId={book.id} entries={entries} />
            </div>
          </section>
        )}
        {(singlePage || frontTextLength > 80) && (
          <section className="mt-10" id="front" aria-label={singlePage ? undefined : "বইয়ের প্রথম পাতা"}>
            {!singlePage && <h2 className="font-display text-2xl text-ink">বইয়ের প্রথম পাতা</h2>}
            <ReaderFrame initialStep={sizeStep}>
              <ReaderText html={frontHtml} />
            </ReaderFrame>
          </section>
        )}
        {singlePage && (
          <ReaderProgress
            bookId={book.id}
            chapter=""
            label=""
            signedIn={Boolean(userId)}
            resume={resuming}
            savedProgress={saved?.chapter === "" ? saved.progress : null}
          />
        )}
        {!singlePage && <ReaderNav bookId={book.id} prev={null} next={entries[0]} />}
        <ReaderAttribution title={root} />
      </Shell>
    );
  }

  // ---- one page of the work ----
  const index = entries.findIndex((e) => e.path === path);
  if (index < 0) notFound();
  const entry = entries[index];
  const prev: TocEntry | "contents" = index > 0 ? entries[index - 1] : "contents";
  const next = entries[index + 1] ?? null;
  const parent = path.split("/").slice(0, -1).join("/");
  const group = parent && !entries.some((e) => e.path === parent) ? (parent.split("/").pop() ?? null) : null;
  const heading = shortLabel(entry.label, group);
  const page = await getChapter(book.id, root, path);

  return (
    <Shell bookId={book.id} name={name} byline={byline} contentsLink>
      {!page.ok ? (
        <>
          <h1 className="mt-6 font-display text-3xl text-ink">{heading}</h1>
          <ReaderUnavailable href={wikisourceUrl(titleInWork(root, path))} missing={page.reason === "missing"} />
        </>
      ) : (
        <>
          {page.stale && <StaleNote />}
          <ReaderFrame initialStep={sizeStep}>
            {group && <p className="text-center font-body text-sm text-ink/60">{group}</p>}
            <h1 className="mb-6 text-center font-display text-[1.6em] leading-snug text-ink">{heading}</h1>
            <ReaderText html={page.value.html} />
          </ReaderFrame>
          <ReaderProgress
            bookId={book.id}
            chapter={path}
            label={entry.label}
            signedIn={Boolean(userId)}
            resume={resuming}
            savedProgress={saved?.chapter === path ? saved.progress : null}
          />
        </>
      )}
      <ReaderNav bookId={book.id} prev={prev} next={next} />
      {page.ok && <ScanLinks scans={page.value.scans} />}
      <ReaderAttribution title={titleInWork(root, path)} />
    </Shell>
  );
}

function Shell({
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
        <p className="mt-3 font-body text-sm text-ink/60">
          {name} · {byline}
        </p>
      )}
      {children}
    </div>
  );
}

// Cleaned on the server by sanitizeWikisourceHtml (src/lib/wikisource/
// sanitize.ts) before it was cached; nothing else is ever put here.
function ReaderText({ html }: { html: string }) {
  return <div className="reader-text" lang="bn" dangerouslySetInnerHTML={{ __html: html }} />;
}

function StaleNote() {
  return (
    <p className="mt-4 rounded-book bg-turmeric/15 px-3 py-2 font-body text-sm text-ink/70">
      উইকিসংকলনের সঙ্গে এখন যোগাযোগ করা যাচ্ছে না; কিছুদিন আগে আনা কপিটি দেখানো হচ্ছে।
    </p>
  );
}
