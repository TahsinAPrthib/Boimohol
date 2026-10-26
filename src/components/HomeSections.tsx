import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { blockedIdsFor } from "@/lib/blocks";
import { describeDbError } from "@/lib/db-errors";
import { averageOf } from "@/lib/ratings";
import { snippet } from "@/lib/snippet";
import BookCard from "@/components/BookCard";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import Reveal from "@/components/Reveal";
import StarRating from "@/components/StarRating";

// Everything below the home hero: signs that people are using the site. It
// streams in behind a skeleton (see app/page.tsx), so the hero never waits on
// the database. A section with nothing to show is left out entirely -- the
// home page never says "nothing here yet", and never shows site-wide counts.
export default async function HomeSections({ viewerId }: { viewerId: string | null }) {
  // Like the marketplace: a signed-in viewer doesn't see listings from
  // sellers they've blocked.
  const listingsPromise = (viewerId ? blockedIdsFor(viewerId) : Promise.resolve([])).then((blocked) =>
    prisma.listing.findMany({
      where: {
        status: "AVAILABLE",
        ...(blocked.length > 0 ? { sellerId: { notIn: blocked } } : {}),
      },
      include: {
        category: { select: { colorKey: true } },
        photos: { orderBy: { order: "asc" }, take: 1, select: { publicId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    })
  );

  const shelvedPromise = prisma.shelfItem
    .groupBy({
      by: ["bookId"],
      _count: { bookId: true },
      orderBy: [{ _count: { bookId: "desc" } }, { bookId: "asc" }],
      take: 6,
    })
    .then(async (groups) => {
      if (groups.length === 0) return [];
      const books = await prisma.book.findMany({
        where: { id: { in: groups.map((g) => g.bookId) } },
        include: { category: { select: { colorKey: true, slug: true } }, reviews: { select: { rating: true } } },
      });
      // findMany doesn't keep the popularity order, so restore it.
      const byId = new Map(books.map((b) => [b.id, b]));
      return groups.map((g) => byId.get(g.bookId)).filter((b) => b !== undefined);
    });

  let data;
  try {
    data = await Promise.all([
      listingsPromise,
      shelvedPromise,
      prisma.review.findMany({
        where: { text: { not: null }, NOT: { text: "" } },
        include: {
          user: { select: { username: true } },
          book: { select: { id: true, title: true, titleBangla: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, slug: true, nameBangla: true, description: true },
      }),
    ]);
  } catch (err) {
    // The home page used to be fully static, so a database outage never
    // touched it. Keep it that way: without this, the error would replace the
    // whole page with Next's error screen. Now the hero still stands and the
    // sections are simply absent until the database is back.
    console.error(`[home] database error loading sections: ${describeDbError(err)}`);
    return null;
  }
  const [listings, shelvedBooks, reviews, categories] = data;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12">
      {listings.length > 0 && (
        <Reveal>
          <SectionHeading
            title="সদ্য তালিকাভুক্ত বই"
            note="পাঠকেরা সম্প্রতি যে বইগুলো বিক্রি, বিনিময় বা দানের জন্য তুলেছেন।"
            href="/marketplace"
            linkLabel="বিনিময় পাতায় সব দেখুন"
          />
          <ShelfRow gridClass="sm:grid-cols-4">
            {listings.map((listing) => (
              <li key={listing.id} className="w-[44%] shrink-0 snap-start sm:w-auto">
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  author={listing.author}
                  colorKey={listing.category?.colorKey}
                  listingType={listing.listingType}
                  price={listing.price}
                  location={listing.location}
                  photoPublicId={listing.photos[0]?.publicId}
                />
              </li>
            ))}
          </ShelfRow>
        </Reveal>
      )}

      {shelvedBooks.length > 0 && (
        <Reveal>
          <SectionHeading
            title="পাঠকদের তাকে সবচেয়ে বেশি"
            note="যে বইগুলো সবচেয়ে বেশি পাঠক নিজের বইতাকে তুলে রেখেছেন।"
            href="/library"
            linkLabel="লাইব্রেরিতে যান"
          />
          <ShelfRow gridClass="sm:grid-cols-3 md:grid-cols-6">
            {shelvedBooks.map((book) => (
              <li key={book.id} className="w-[38%] shrink-0 snap-start sm:w-auto">
                <BookCard
                  id={book.id}
                  title={book.title}
                  titleBangla={book.titleBangla}
                  coverPublicId={book.coverPublicId}
                  author={book.author}
                  colorKey={book.category.colorKey}
                  categorySlug={book.category.slug}
                  averageRating={averageOf(book.reviews)}
                  reviewCount={book.reviews.length}
                />
              </li>
            ))}
          </ShelfRow>
        </Reveal>
      )}

      {reviews.length > 0 && (
        <Reveal>
          <SectionHeading title="সাম্প্রতিক পর্যালোচনা" note="পাঠকেরা সম্প্রতি যা পড়ে লিখেছেন।" />
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id}>
                <figure className="flex h-full flex-col rounded-book border-2 border-ink/10 bg-paper-dark p-5 shadow-shelf">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <Link
                      href={`/books/${review.book.id}`}
                      className="font-display text-lg leading-snug text-ink transition-colors hover:text-cloth"
                    >
                      {review.book.titleBangla || review.book.title}
                    </Link>
                    <StarRating value={review.rating} readOnly size="sm" />
                  </div>
                  <blockquote className="mt-3 flex-1 font-body text-sm leading-relaxed text-ink/75">
                    &ldquo;{snippet(review.text ?? "")}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 font-body text-xs font-semibold text-ink/50">
                    — @{review.user.username}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {categories.length > 0 && (
        <Reveal>
          <SectionHeading title="বিভাগসমূহ" />
          <CategoryGrid categories={categories} headingLevel="h3" />
        </Reveal>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  note,
  href,
  linkLabel,
}: {
  title: string;
  note?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink/10 pb-3">
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {note && <p className="mt-1 font-body text-sm text-ink/60">{note}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="font-body text-sm font-semibold text-cloth hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

// A row of books standing on a plank. On phones it scrolls sideways (with the
// next book peeking in, so it's obviously scrollable) instead of stacking
// into a long column; from sm up it is a plain grid.
function ShelfRow({ children, gridClass }: { children: ReactNode; gridClass: string }) {
  return (
    <div>
      <ul
        className={`-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 pt-2 sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 ${gridClass}`}
      >
        {children}
      </ul>
      <div aria-hidden="true" className="h-2 rounded-book bg-paper-dark shadow-shelf" />
    </div>
  );
}
