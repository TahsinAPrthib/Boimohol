import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadBook } from "@/lib/loaders";
import { bookShareMetadata, previewText } from "@/lib/share";
import { canBePublicDomain } from "@/lib/public-domain";
import { bn, bnFixed, bnYear } from "@/lib/bangla";
import { coverSourceLabel } from "@/lib/covers";
import { readerSource } from "@/lib/wikisource/reader";
import { firstLineOf, quotedLine } from "@/lib/first-lines";
import { dhakaDateKey } from "@/lib/daily";
import { loadCategoryShelf, loadTodaysShelf, type ShelfBook } from "@/lib/todays-book";
import BookCover from "@/components/BookCover";
import BookFreeCopies from "@/components/BookFreeCopies";
import ShelfStage from "@/components/ShelfStage";
import StarRating from "@/components/StarRating";

const languageNames = new Intl.DisplayNames(["bn"], { type: "language" });

// The book's title and author in the tab and in link previews, with its
// description and its card (src/lib/share.ts).
export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const book = await loadBook(id);
  if (!book) return {};
  const name = book.titleBangla || book.title;
  return {
    title: `${name} — ${book.author} · বই মহল`,
    ...(book.description ? { description: previewText(book.description) } : {}),
    ...bookShareMetadata(book, `/books/${encodeURIComponent(book.id)}`),
  };
}

// The book page's header: the book standing in front of a shelf of its
// category, its title, its first line when that has been checked
// (src/lib/first-lines.ts), and its free copies. It is a layout, above the
// page's loading boundary, because it needs only the book and not the
// visitor: it comes with the link's prefetch, so it is on screen the moment a
// cover is tapped and the cover can move straight into place
// (CoverTransition). The page below it -- the shelf buttons and the reviews --
// streams in behind a skeleton.
export default async function BookHeaderLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const book = await loadBook(id);
  if (!book) notFound();

  const reviewCount = book.reviews.length;
  const averageRating = reviewCount > 0 ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
  // As in the library: no free copy offered -- PDF or link -- unless the book
  // passes the public-domain rule today, whatever its stored flag says.
  const free = book.isPublicDomain && canBePublicDomain(book.authorDeathYear);
  const freeFile = free ? (book.files.find((f) => f.publicId) ?? null) : null;
  const freeSources = free ? book.sources : [];
  const readHref = readerSource(book) ? `/books/${encodeURIComponent(book.id)}/read` : null;
  const firstLine = free ? firstLineOf(book.id) : null;
  const name = book.titleBangla || book.title;

  // The shelf behind the book: its category's free books, or the home page's
  // shelf where the category has too few. Five, as many as show around the
  // cover (it is in every prefetch). Decoration only, so a failure leaves the
  // book standing on an empty board.
  let shelf: ShelfBook[] = [];
  try {
    shelf = (await loadCategoryShelf(book.categoryId, book.language)).filter((b) => b.id !== book.id).slice(0, 5);
    if (shelf.length < 4) shelf = ((await loadTodaysShelf(dhakaDateKey()))?.shelf ?? []).filter((b) => b.id !== book.id).slice(0, 5);
  } catch (err) {
    console.error(`[book] the shelf for ${book.id} couldn't be loaded: ${err instanceof Error ? err.message : err}`);
  }

  return (
    // relative: the page's ScrollAnchor is pinned to this box's top.
    <div className="relative mx-auto max-w-5xl px-4 pb-10 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:pt-10">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ShelfStage
          size="book"
          books={shelf}
          className="-mx-4 lg:mx-0"
          front={
            <div data-book-cover={book.id}>
              <BookCover
                bookId={book.id}
                categorySlug={book.category.slug}
                title={book.title}
                titleBangla={book.titleBangla}
                coverPublicId={book.coverPublicId}
                context="stage"
                // Prefetched with every book link on screen, but its image
                // only loads once the page is shown (PriorityImage).
                priority
                author={book.author}
                colorKey={book.category.colorKey}
              />
            </div>
          }
        />
        {book.coverPublicId && book.coverSourceUrl && (
          <p className="mt-2 text-center font-body text-xs leading-snug text-ink/70" data-cover-credit>
            প্রচ্ছদের উৎস:{" "}
            <a href={book.coverSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-cloth">
              {coverSourceLabel(book.coverSourceUrl)}
            </a>
            {book.coverRightsBasis && <span className="mt-0.5 block">{book.coverRightsBasis}</span>}
          </p>
        )}
      </div>

      <div className="mt-6 min-w-0 lg:mt-0">
        <Link href={`/categories/${book.category.slug}`} className="font-body text-sm font-semibold text-cloth hover:underline">
          {book.category.nameBangla}
        </Link>
        <h1 className="mt-1 font-display text-[2.4rem] leading-tight text-ink lg:text-5xl">{name}</h1>
        {book.titleBangla && <p className="font-body text-ink/70">{book.title}</p>}
        <p className="mt-1 font-body text-lg text-ink/80">{book.author}</p>
        {book.translator && <p className="font-body text-sm text-ink/70">অনুবাদ: {book.translator}</p>}

        <div className="mt-3 flex items-center gap-2">
          <StarRating value={averageRating} readOnly />
          <span className="font-body text-sm text-ink/70">
            {reviewCount > 0 ? `${bnFixed(averageRating)} (${bn(reviewCount)}টি পর্যালোচনা)` : "এখনো কোনো পর্যালোচনা নেই"}
          </span>
        </div>

        {firstLine && (
          <figure className="mt-6" data-first-line>
            <blockquote className="font-display text-[1.6rem] leading-snug text-ink lg:text-[1.9rem]">{quotedLine(firstLine.line)}</blockquote>
            <figcaption className="mt-1.5 font-body text-sm text-ink/70">
              প্রথম লাইন{firstLine.chapter ? ` · ${firstLine.chapter}` : ""}
            </figcaption>
          </figure>
        )}

        {book.description && <p className="mt-5 max-w-prose font-body text-ink/80">{book.description}</p>}

        <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 font-body text-sm">
          <dt className="text-ink/70">ভাষা</dt>
          <dd className="text-ink">{languageNames.of(book.language) ?? book.language}</dd>
          {book.authorDeathYear !== null && (
            <>
              <dt className="text-ink/70">লেখকের মৃত্যু</dt>
              <dd className="text-ink">
                {bnYear(book.authorDeathYear)} সালে{free ? " · কপিরাইটের মেয়াদ শেষ" : ""}
              </dd>
            </>
          )}
        </dl>

        <BookFreeCopies
          file={freeFile && freeFile.publicId ? { ...freeFile, publicId: freeFile.publicId } : null}
          sources={freeSources}
          readHref={readHref}
        />

        {props.children}
      </div>
    </div>
  );
}
