import Link from "next/link";
import { preload } from "react-dom";
import BookCover from "@/components/BookCover";
import ShelfStage from "@/components/ShelfStage";
import { bnDayMonth, dhakaDateKey } from "@/lib/daily";
import { COVER_SIZES, coverSrcSet, coverUrl } from "@/lib/covers";
import { loadTodaysShelf, type TodaysShelf } from "@/lib/todays-book";

const INTRO_HOME = "বাংলা বইয়ের ঘর —";
const INTRO_INVITE = "হাজারো বই বিনামূল্যে পড়ুন";
const INTRO = `${INTRO_HOME} ${INTRO_INVITE}`;

// The home page's first screen: one line saying what the site is, then the
// shelf with the book of the day (আজকের বই) pulled forward. The day's choice
// comes from the data cache (src/lib/todays-book.ts), so a visit doesn't
// query the database; if it can't be had at all, the screen keeps the line
// and the two ways in, without the shelf.
export default async function HomeShelf({ isLoggedIn }: { isLoggedIn: boolean }) {
  const dateKey = dhakaDateKey();
  let today: TodaysShelf | null = null;
  try {
    today = await loadTodaysShelf(dateKey);
  } catch (err) {
    console.error(`[home] the book of the day couldn't be loaded: ${err instanceof Error ? err.message : err}`);
  }

  const secondary = isLoggedIn ? { href: "/profile", label: "আমার বইতাক" } : { href: "/library", label: "লাইব্রেরি ঘুরে দেখুন" };

  if (!today) {
    return (
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 lg:pt-16">
        <h1 className="max-w-2xl font-display text-3xl leading-snug text-ink sm:text-4xl">{INTRO}</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/library" className="btn-accent">
            বিনামূল্যে পড়ুন
          </Link>
          <Link href={isLoggedIn ? "/profile" : "/search"} className="btn-secondary">
            {isLoggedIn ? "আমার বইতাক" : "বই খুঁজুন"}
          </Link>
        </div>
      </section>
    );
  }

  const { book, shelf } = today;
  const name = book.titleBangla || book.title;
  // The day's cover is the page's largest paint: start it before anything
  // else, at the width this screen will pick (preload with the same srcset),
  // from the site's own address so no second connection is opened for it.
  if (book.coverPublicId) {
    const { sizes, widths } = COVER_SIZES.today;
    preload(coverUrl(book.coverPublicId, widths[1], true), {
      as: "image",
      imageSrcSet: coverSrcSet(book.coverPublicId, widths, true),
      imageSizes: sizes,
      fetchPriority: "high",
    });
  }

  return (
    <section aria-labelledby="home-intro" className="pb-10 lg:pb-14">
      <div className="mx-auto max-w-5xl px-4 pt-5 lg:pt-8 lg:text-center">
        {/* On a phone the line breaks after the dash, so no word is left
            alone on the second line. */}
        <h1 id="home-intro" className="font-display text-xl leading-snug text-ink sm:text-2xl">
          {INTRO_HOME} <br className="sm:hidden" />
          {INTRO_INVITE}
        </h1>
      </div>

      <ShelfStage
        books={shelf}
        drifting
        className="mt-3 lg:mt-4"
        tag={<p className="shelf-tag">আজকের বই · {bnDayMonth(dateKey)}</p>}
        front={
          <Link href={`/books/${encodeURIComponent(book.id)}`} className="group block" aria-label={`${name}, বইয়ের পাতা`}>
            <BookCover
              bookId={book.id}
              categorySlug={book.category.slug}
              title={book.title}
              titleBangla={book.titleBangla}
              author={book.author}
              colorKey={book.category.colorKey}
              coverPublicId={book.coverPublicId}
              context="today"
              priority
              className="book-lift"
            />
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl px-4 pt-6 lg:pt-8 lg:text-center">
        <h2 className="font-display text-[2.4rem] leading-tight text-ink lg:text-[3.2rem]">{name}</h2>
        <p className="mt-1 font-body text-lg text-ink/70">
          {book.author}
          {book.translator && ` · অনুবাদ: ${book.translator}`}
        </p>
        {book.description && <p className="mt-3 max-w-[46ch] font-body text-ink/80 lg:mx-auto">{book.description}</p>}
        <div className="mt-5 flex flex-wrap gap-3 lg:justify-center">
          <Link href={book.readHref ?? `/books/${encodeURIComponent(book.id)}`} className="btn-accent min-h-12">
            আজকের বইটি পড়ুন
          </Link>
          <Link href={secondary.href} className="btn-secondary min-h-12">
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
