import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicDomainCutoffYear } from "@/lib/public-domain";
import { SOURCE_LABEL } from "@/lib/book-sources";
import BookCard from "@/components/BookCard";
import SearchBox from "@/components/SearchBox";
import NoResults from "@/components/NoResults";
import LanguageChips from "@/components/LanguageChips";
import Pager from "@/components/Pager";
import { hrefWith, readQuery, searchFilter } from "@/lib/search";
import { languageParam, languagePhrase, languageWhere, readLanguage, readPage } from "@/lib/book-language";
import { curatedFirstPage } from "@/lib/book-listing";

export default async function LibraryPage(props: {
  searchParams: Promise<{ category?: string; q?: string | string[]; lang?: string | string[]; page?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedSlug = searchParams.category;
  const q = readQuery(searchParams.q);
  const search = searchFilter(q);
  const lang = readLanguage(searchParams.lang);
  const langParam = languageParam(lang);

  // Only books that actually carry a free copy: a PDF hosted here, or a link
  // to one on Wikisource, Project Gutenberg or the Internet Archive.
  // rightsVerified is part of the filter as well as the type: a file row is
  // only ever written with it true after the public-domain gate passes, so
  // this keeps the public list honest even if a row were ever created some
  // other way. The book itself must also pass the public-domain rule today,
  // so a copy left on a book that was wrongly flagged is no longer offered
  // while it waits to be removed.
  const freeFile = { type: "FREE", rightsVerified: true } as const;
  const where = {
    ...(selectedSlug ? { category: { slug: selectedSlug } } : {}),
    OR: [{ files: { some: freeFile } }, { sources: { some: {} } }],
    isPublicDomain: true,
    authorDeathYear: { lte: publicDomainCutoffYear() },
    ...languageWhere(lang),
    ...search,
  };
  // Curated books first, then the rest by title; one page of it.
  const { ids: pageIds, page, pages } = await curatedFirstPage(where, readPage(searchParams.page), { cacheCount: !search });
  const loaded = await prisma.book.findMany({
    where: { id: { in: pageIds } },
    include: {
      category: { select: { colorKey: true, slug: true } },
      reviews: { select: { rating: true } },
      files: { where: freeFile, select: { id: true }, take: 1 },
      sources: { select: { kind: true }, orderBy: [{ kind: "asc" }, { createdAt: "asc" }] },
    },
  });
  const byId = new Map(loaded.map((b) => [b.id, b]));
  const books = pageIds.map((id) => byId.get(id)).filter((b) => b !== undefined);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 border-b-2 border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-ink">লাইব্রেরি</h1>
        <p className="mt-2 max-w-prose font-body text-ink/70">
          পাবলিক ডোমেইনের বই — যেগুলোর কপিরাইটের মেয়াদ শেষ হয়ে গেছে, তাই যে কেউ বিনামূল্যে পড়তে
          ও নামাতে পারেন। কিছু বইয়ের পিডিএফ এখানেই রাখা আছে; বাকিগুলো পড়া যায় উইকিসংকলন, প্রজেক্ট
          গুটেনবার্গ বা ইন্টারনেট আর্কাইভের মতো বিশ্বস্ত সাইটে।
        </p>
      </div>

      <SearchBox label="লাইব্রেরিতে খুঁজুন" placeholder="বইয়ের নাম বা লেখক" className="mb-4" />

      <LanguageChips path="/library" params={{ category: selectedSlug, q }} active={lang} className="mb-4" />

      <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-ink/10 pb-6">
        <Link
          href={hrefWith("/library", { q, lang: langParam })}
          className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold ${
            !selectedSlug
              ? "border-cloth bg-cloth text-paper"
              : "border-ink/20 text-ink hover:border-ink/40"
          }`}
        >
          সব বিভাগ
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={hrefWith("/library", { category: cat.slug, q, lang: langParam })}
            className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold ${
              selectedSlug === cat.slug
                ? "border-cloth bg-cloth text-paper"
                : "border-ink/20 text-ink hover:border-ink/40"
            }`}
          >
            {cat.nameBangla}
          </Link>
        ))}
      </div>

      {books.length === 0 && search ? (
        <NoResults query={q} where={selectedSlug ? "এই বিভাগে" : "লাইব্রেরিতে"} />
      ) : books.length === 0 ? (
        <p className="rounded-book border-2 border-dashed border-ink/15 px-4 py-6 text-center font-body text-ink/60">
          {lang !== "all"
            ? `${languagePhrase(lang)} কোনো বিনামূল্যের বই ${selectedSlug ? "এই বিভাগে " : ""}এখনো নেই।`
            : selectedSlug
              ? "এই বিভাগে এখনো কোনো বিনামূল্যের বই নেই।"
              : "লাইব্রেরিতে এখনো কোনো বই যোগ করা হয়নি। শিগগিরই আসছে।"}
        </p>
      ) : (
        <>
          {/* No count here: with a small library, a low number makes it look empty. */}
          <p className="mb-4 font-body text-sm text-ink/50">
            পছন্দের বইটি খুলে বিনামূল্যে পড়ুন — এখানে রাখা পিডিএফ নামিয়ে, অথবা বাইরের সাইটে গিয়ে।
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                titleBangla={book.titleBangla}
                coverPublicId={book.coverPublicId}
                author={book.author}
                colorKey={book.category.colorKey}
                categorySlug={book.category.slug}
                averageRating={
                  book.reviews.length
                    ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length
                    : 0
                }
                reviewCount={book.reviews.length}
                tags={[
                  ...(book.files.length > 0 ? [{ label: "এখানেই · পিডিএফ", external: false }] : []),
                  ...[...new Set(book.sources.map((s) => s.kind))].map((k) => ({
                    label: `বাইরের সাইটে · ${SOURCE_LABEL[k]}`,
                    external: true,
                  })),
                ]}
              />
            ))}
          </div>
          <Pager path="/library" params={{ category: selectedSlug, q, lang: langParam }} page={page} pages={pages} />
        </>
      )}
    </div>
  );
}
