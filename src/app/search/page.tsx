import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import { averageOf } from "@/lib/ratings";
import { hrefWith, readQuery, searchFilter } from "@/lib/search";
import { searchBookIds } from "@/lib/book-search";
import BookCard from "@/components/BookCard";
import ListingCard from "@/components/ListingCard";
import RequestCard from "@/components/RequestCard";
import SearchBox from "@/components/SearchBox";
import NoResults from "@/components/NoResults";
import LanguageChips from "@/components/LanguageChips";
import CategoryGrid from "@/components/CategoryGrid";
import { readLanguage } from "@/lib/book-language";

export const metadata: Metadata = {
  title: "খুঁজুন — বই মহল",
  description: "বই, বিনিময়ের তালিকা আর পাঠকদের অনুরোধ — সব এক জায়গায় খুঁজুন।",
};

const BOOKS_SHOWN = 24;
const LISTINGS_SHOWN = 8;
const REQUESTS_SHOWN = 6;

function GroupHeading({ title, more }: { title: string; more?: { href: string; label: string } }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink/10 pb-2">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {more && (
        <Link href={more.href} className="font-body text-sm font-semibold text-cloth hover:underline">
          {more.label} →
        </Link>
      )}
    </div>
  );
}

export default async function SearchPage(props: { searchParams: Promise<{ q?: string | string[]; lang?: string | string[] }> }) {
  const searchParams = await props.searchParams;
  const q = readQuery(searchParams.q);
  const search = searchFilter(q);
  // The language filter narrows the books; listings and requests aren't books
  // in a language, so they stay as they are.
  const lang = readLanguage(searchParams.lang);

  // On phones the navbar has only an icon, so the box lives here; from lg up
  // the navbar's own box drives this page.
  const box = (
    <SearchBox
      label="সাইটে খুঁজুন"
      placeholder="বই, লেখক, এলাকা…"
      autoFocus
      className="mb-8 lg:hidden"
    />
  );

  if (!search) {
    // On phones the খুঁজুন tab is also the way to the categories, which
    // the desktop navbar links to directly.
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, nameBangla: true, description: true },
    });
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 font-display text-3xl text-ink">খুঁজুন</h1>
        {box}
        <p className="max-w-prose font-body text-ink/70">
          বইয়ের নাম (বাংলা বা ইংরেজি), লেখকের নাম, কিংবা বিনিময়ের বইয়ের এলাকা লিখে খুঁজুন। বই, বিনিময়ের তালিকা আর খোলা
          অনুরোধ — সব একসাথে দেখাবে।
        </p>
        {categories.length > 0 && (
          <section aria-labelledby="search-categories" className="mt-10 lg:hidden">
            <h2 id="search-categories" className="mb-4 font-display text-xl text-ink">
              বিভাগ ধরে দেখুন
            </h2>
            <CategoryGrid categories={categories} headingLevel="h3" compact />
          </section>
        )}
      </div>
    );
  }

  // The same visibility rules as each list page: only available listings and
  // open requests, and nothing from people the viewer has blocked.
  const viewerId = await getSessionUserId();
  const blocked = viewerId ? await blockedIdsFor(viewerId) : [];

  const [found, listings, requests] = await Promise.all([
    // Ranked in the database: only the books shown are read (book-search.ts).
    searchBookIds(q, lang, BOOKS_SHOWN).then(async ({ ids, more }) => {
      const loaded = await prisma.book.findMany({
        where: { id: { in: ids } },
        include: { category: { select: { colorKey: true, slug: true } }, reviews: { select: { rating: true } } },
      });
      const byId = new Map(loaded.map((b) => [b.id, b]));
      return { books: ids.map((id) => byId.get(id)).filter((b) => b !== undefined), more };
    }),
    prisma.listing.findMany({
      where: { status: "AVAILABLE", ...(blocked.length > 0 ? { sellerId: { notIn: blocked } } : {}), ...search },
      include: { category: true, photos: { orderBy: { order: "asc" }, take: 1, select: { publicId: true } } },
      orderBy: { createdAt: "desc" },
      take: LISTINGS_SHOWN + 1,
    }),
    prisma.bookRequest.findMany({
      where: { status: "OPEN", ...(blocked.length > 0 ? { requesterId: { notIn: blocked } } : {}), ...search },
      include: {
        category: { select: { nameBangla: true } },
        requester: { select: { username: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
      take: REQUESTS_SHOWN + 1,
    }),
  ]);

  // Best matches first, ranked by the database (book-search.ts).
  const rankedBooks = found.books;
  const nothing = rankedBooks.length === 0 && listings.length === 0 && requests.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl text-ink [overflow-wrap:anywhere]">“{q}” খোঁজার ফলাফল</h1>
      {box}
      <LanguageChips path="/search" params={{ q }} active={lang} className="mb-8" />

      {nothing ? (
        <NoResults query={q} />
      ) : (
        <div className="flex flex-col gap-12">
          {rankedBooks.length > 0 && (
            <section>
              <GroupHeading title="বই" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {rankedBooks.map((book) => (
                  <BookCard
                    key={book.id}
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
                ))}
              </div>
              {found.more && (
                <p className="mt-4 font-body text-sm text-ink/70">আরও বই মিলেছে — আরেকটু নির্দিষ্ট করে লিখলে সেগুলো আগে আসবে।</p>
              )}
            </section>
          )}

          {listings.length > 0 && (
            <section>
              <GroupHeading
                title="বিনিময়ে পাওয়া যাচ্ছে"
                more={listings.length > LISTINGS_SHOWN ? { href: hrefWith("/marketplace", { q }), label: "সব দেখুন" } : undefined}
              />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {listings.slice(0, LISTINGS_SHOWN).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    author={listing.author}
                    colorKey={listing.category?.colorKey}
                    listingType={listing.listingType}
                    price={listing.price}
                    location={listing.location}
                    photoPublicId={listing.photos[0]?.publicId}
                  />
                ))}
              </div>
            </section>
          )}

          {requests.length > 0 && (
            <section>
              <GroupHeading
                title="পাঠকদের অনুরোধ"
                more={requests.length > REQUESTS_SHOWN ? { href: hrefWith("/requests", { q }), label: "সব দেখুন" } : undefined}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {requests.slice(0, REQUESTS_SHOWN).map((request) => (
                  <RequestCard
                    key={request.id}
                    id={request.id}
                    title={request.title}
                    author={request.author}
                    categoryName={request.category?.nameBangla}
                    requesterUsername={request.requester.username}
                    responseCount={request._count.responses}
                    status={request.status}
                    location={request.location}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
