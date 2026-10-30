import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { loadBook } from "@/lib/loaders";
import { bookShareMetadata } from "@/lib/share";
import { readerSource } from "@/lib/reader/source";
import { getChapter, loadContents, type TocEntry } from "@/lib/wikisource/reader";
import { getGutenbergPage, loadGutenbergContents } from "@/lib/gutenberg/reader";
import { gutenbergLanding } from "@/lib/gutenberg/source";
import { READER_SIZE_COOKIE, readSizeStep } from "@/lib/wikisource/reader-prefs";
import { pathFromSegments, readerHref, titleInWork, wikisourceUrl } from "@/lib/wikisource/titles";
import ReaderFrame from "@/components/reader/ReaderFrame";
import ReaderProgress from "@/components/reader/ReaderProgress";
import ResumeReading from "@/components/reader/ResumeReading";
import { ReaderShell as Shell, ReaderText, StaleNote } from "@/components/reader/ReaderShell";
import { GutenbergAttribution, OPENING, ReaderAttribution, ReaderNav, ReaderToc, ReaderUnavailable, ScanLinks, shortLabel } from "@/components/reader/ReaderParts";

type Props = {
  params: Promise<{ id: string; chapter?: string[] }>;
  searchParams: Promise<{ resume?: string | string[] }>;
};

// /books/[id]/read is the work's contents (and its main page's text: the
// whole text, for a work on a single page); /books/[id]/read/<path> is one of
// its pages. The text comes from Bangla Wikisource (src/lib/wikisource/) or
// from Project Gutenberg (src/lib/gutenberg/), cleaned on the server; which
// one, src/lib/reader/source.ts decides.

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
  // The source is the place for search engines to find the text; here it
  // is a reading view, and crawling it would only fetch from the source.
  const robots = { index: false, follow: false };
  const { book, source } = reader;
  const name = book.titleBangla || book.title;
  const path = pathFromSegments(chapter ?? []);
  // The layouts answer these with the not-found page; its title, too.
  if (path === null) return { title: NOT_FOUND_TITLE, robots };
  let label = "";
  if (path) {
    const contents = source.kind === "wikisource" ? await loadContents(book.id, source.root) : await loadGutenbergContents(book.id, source.ebookId);
    const entry = contents.ok ? contents.value.entries.find((e) => e.path === path) : undefined;
    if (contents.ok && !entry) return { title: NOT_FOUND_TITLE, robots };
    label = entry?.label ?? "";
  }
  // A link to a page of the reader, shared, shows the book's own preview.
  return { title: `${label ? `${label} — ` : ""}${name} · বই মহলে পড়ুন`, robots, ...bookShareMetadata(book, readerHref(book.id, path)) };
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
  const page: ReaderPageProps = {
    book,
    path,
    userId,
    sizeStep: readSizeStep(cookieStore.get(READER_SIZE_COOKIE)?.value),
    name: book.titleBangla || book.title,
    byline: `${book.author}${book.translator ? ` · অনুবাদ: ${book.translator}` : ""}`,
    resuming: resume === "1",
  };
  return source.kind === "gutenberg" ? gutenbergPage(page, source.ebookId) : wikisourcePage(page, source.root, source.url);
}

type ReaderPageProps = {
  book: { id: string; language: string; translator: string | null };
  path: string;
  userId: string | null;
  sizeStep: number;
  name: string;
  byline: string;
  resuming: boolean;
};

const savedPosition = (userId: string | null, bookId: string) =>
  userId ? prisma.readingPosition.findUnique({ where: { userId_bookId: { userId, bookId } }, select: { chapter: true, progress: true } }) : null;

async function wikisourcePage({ book, path, userId, sizeStep, name, byline, resuming }: ReaderPageProps, storedRoot: string, url: string) {
  const contents = await loadContents(book.id, storedRoot);
  if (!contents.ok) {
    return (
      <Shell bookId={book.id} name={name} byline={byline} heading>
        <ReaderUnavailable href={url} missing={contents.reason === "missing"} />
      </Shell>
    );
  }
  const { root, entries, frontHtml, frontTextLength, scans } = contents.value;
  const saved = await savedPosition(userId, book.id);
  const labelOf = (p: string) => entries.find((e) => e.path === p)?.label ?? "";

  // ---- the contents page ----
  if (path === "") {
    const singlePage = entries.length === 0;
    return (
      <Shell bookId={book.id} name={name} byline={byline} heading>
        {contents.stale && <StaleNote source="wikisource" />}
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
          {page.stale && <StaleNote source="wikisource" />}
          <ReaderFrame initialStep={sizeStep}>
            {group && <p className="text-center font-body text-sm text-ink/70">{group}</p>}
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

// A Gutenberg book: its contents and front page, then its chapters, "1", "2"…
// Its text is in the language Gutenberg gives it; failing that, English
// unless the book is in Bangla and not a translation.
async function gutenbergPage({ book, path, userId, sizeStep, name, byline, resuming }: ReaderPageProps, ebookId: number) {
  const contents = await loadGutenbergContents(book.id, ebookId);
  if (!contents.ok) {
    return (
      <Shell bookId={book.id} name={name} byline={byline} heading>
        <ReaderUnavailable source="gutenberg" href={gutenbergLanding(ebookId)} missing={contents.reason === "missing"} />
      </Shell>
    );
  }
  const { entries, front, images } = contents.value;
  const lang = contents.value.lang ?? (book.language === "bn" && !book.translator ? "bn" : "en");
  const saved = await savedPosition(userId, book.id);
  const labelOf = (p: string) => entries.find((e) => e.path === p)?.label ?? "";
  const credit = <GutenbergAttribution ebookId={ebookId} images={images > 0} />;

  if (path === "") {
    const singlePage = entries.length === 0;
    return (
      <Shell bookId={book.id} name={name} byline={byline} heading>
        {contents.stale && <StaleNote source="gutenberg" />}
        <ResumeReading
          bookId={book.id}
          signedIn={Boolean(userId)}
          saved={saved ? { chapter: saved.chapter, label: labelOf(saved.chapter), progress: saved.progress } : null}
          startHref={singlePage ? null : readerHref(book.id, entries[0].path)}
          singlePage={singlePage}
        />
        {images > 0 && (
          <p className="mt-6 font-body text-sm text-ink/70" data-images-note>
            এখানে শুধু লেখা; বইয়ের ছবিগুলো দেখা যাবে{" "}
            <a href={gutenbergLanding(ebookId)} target="_blank" rel="noopener noreferrer" className="text-cloth underline">
              প্রজেক্ট গুটেনবার্গের সংস্করণে
            </a>
            ।
          </p>
        )}
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
        {(singlePage || front.replace(/<[^>]*>/g, "").trim().length > 80) && (
          <section className="mt-10" id="front" aria-label={singlePage ? undefined : "বইয়ের প্রথম পাতা"}>
            {!singlePage && <h2 className="font-display text-2xl text-ink">বইয়ের প্রথম পাতা</h2>}
            <ReaderFrame initialStep={sizeStep}>
              <ReaderText html={front} lang={lang} />
            </ReaderFrame>
          </section>
        )}
        {singlePage && (
          <ReaderProgress bookId={book.id} chapter="" label="" signedIn={Boolean(userId)} resume={resuming} savedProgress={saved?.chapter === "" ? saved.progress : null} />
        )}
        {!singlePage && <ReaderNav bookId={book.id} prev={null} next={entries[0]} />}
        {credit}
      </Shell>
    );
  }

  const index = entries.findIndex((e) => e.path === path);
  if (index < 0) notFound();
  const entry = entries[index];
  const prev: TocEntry | "contents" = index > 0 ? entries[index - 1] : "contents";
  const next = entries[index + 1] ?? null;
  const group = entry.group ?? null;
  const heading = shortLabel(entry.label, group);
  const html = await getGutenbergPage(book.id, ebookId, index + 1);

  return (
    <Shell bookId={book.id} name={name} byline={byline} contentsLink>
      {html === null ? (
        <>
          <h1 className="mt-6 font-display text-3xl text-ink">{heading}</h1>
          <ReaderUnavailable source="gutenberg" href={gutenbergLanding(ebookId)} />
        </>
      ) : (
        <>
          {contents.stale && <StaleNote source="gutenberg" />}
          <ReaderFrame initialStep={sizeStep}>
            {group && (
              <p className="text-center font-body text-sm text-ink/70" lang={lang}>
                {group}
              </p>
            )}
            <h1 className="mb-6 text-center font-display text-[1.6em] leading-snug text-ink" lang={heading === OPENING ? "bn" : lang}>
              {heading}
            </h1>
            <ReaderText html={html} lang={lang} />
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
      {credit}
    </Shell>
  );
}
