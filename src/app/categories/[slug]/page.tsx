import { notFound } from "next/navigation";
import Link from "next/link";
import { loadCategory } from "@/lib/loaders";
import { averageOf } from "@/lib/ratings";
import BookCover from "@/components/BookCover";
import BookCard from "@/components/BookCard";
import StarRating from "@/components/StarRating";
import SearchBox from "@/components/SearchBox";
import NoResults from "@/components/NoResults";
import LanguageChips from "@/components/LanguageChips";
import Pager from "@/components/Pager";
import { prisma } from "@/lib/prisma";
import { readQuery, searchFilter } from "@/lib/search";
import { banglaFirst, inLanguage, languageParam, languagePhrase, languageWhere, pageOf, readLanguage, readPage } from "@/lib/book-language";

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string | string[]; lang?: string | string[]; page?: string | string[] }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const category = await loadCategory(params.slug);

  if (!category) notFound();

  // A search narrows this category's books; the normal page comes back when
  // the box is cleared. The language filter applies to both.
  const q = readQuery(searchParams.q);
  const search = searchFilter(q);
  const lang = readLanguage(searchParams.lang);
  const path = `/categories/${category.slug}`;

  // The starter pick leads the plain list when its language is being shown,
  // and then isn't repeated in it.
  const pick = category.starterPicks[0];
  const showPick = !search && pick !== undefined && inLanguage(pick.book.language, lang);

  const where = {
    categoryId: category.id,
    ...languageWhere(lang),
    ...search,
    ...(showPick ? { id: { not: pick.bookId } } : {}),
  };
  // Order the whole list by its titles (Bangla books first), then load one page.
  const listed = await prisma.book.findMany({ where, select: { id: true, title: true, titleBangla: true, language: true } });
  const { items: pageIds, page, pages } = pageOf(banglaFirst(listed).map((b) => b.id), readPage(searchParams.page));
  const loaded = await prisma.book.findMany({ where: { id: { in: pageIds } }, include: { reviews: { select: { rating: true } } } });
  const byId = new Map(loaded.map((b) => [b.id, b]));
  const books = pageIds.map((id) => byId.get(id)).filter((b) => b !== undefined);

  const pagerParams = { q, lang: languageParam(lang) };
  const grid = (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title}
          titleBangla={book.titleBangla}
          coverPublicId={book.coverPublicId}
          author={book.author}
          colorKey={category.colorKey}
          categorySlug={category.slug}
          averageRating={averageOf(book.reviews)}
          reviewCount={book.reviews.length}
        />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 border-b-2 border-ink/10 pb-8">
        <h1 className="font-display text-3xl text-ink">{category.nameBangla}</h1>
        {category.description && (
          <p className="mt-2 max-w-prose font-body text-ink/70">{category.description}</p>
        )}
      </div>

      <SearchBox label={`${category.nameBangla} বিভাগে খুঁজুন`} placeholder="এই বিভাগে বইয়ের নাম বা লেখক" className="mb-4" />
      <LanguageChips path={path} params={{ q }} active={lang} className="mb-10" />

      {search ? (
        books.length === 0 ? (
          <NoResults query={q} where="এই বিভাগে" />
        ) : (
          <>
            <h2 className="mb-5 font-display text-xl text-ink">খোঁজার ফলাফল</h2>
            {grid}
            <Pager path={path} params={pagerParams} page={page} pages={pages} />
          </>
        )
      ) : (
        <>
          {showPick && page === 1 && (
            <div className="mb-12 overflow-hidden rounded-book border-2 border-turmeric shadow-shelf">
              <div className="bg-turmeric px-5 py-2">
                <span className="font-display text-sm font-semibold text-ink/80">
                  শুরু করুন এখান থেকে
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 bg-paper-dark p-6 sm:grid-cols-[160px_1fr]">
                <Link href={`/books/${pick.book.id}`} className="mx-auto w-full max-w-[160px] sm:mx-0">
                  <BookCover
                    bookId={pick.book.id}
                    categorySlug={category.slug}
                    title={pick.book.title}
                    titleBangla={pick.book.titleBangla}
                    coverPublicId={pick.book.coverPublicId}
                    author={pick.book.author}
                    colorKey={category.colorKey}
                  />
                </Link>
                <div>
                  <Link href={`/books/${pick.book.id}`} className="font-display text-2xl text-ink hover:text-cloth">
                    {pick.book.titleBangla || pick.book.title}
                  </Link>
                  <p className="mt-1 font-body text-ink/60">{pick.book.author}</p>
                  <div className="mt-2">
                    <StarRating value={averageOf(pick.book.reviews)} readOnly size="sm" />
                  </div>
                  <p className="mt-4 max-w-prose font-body text-ink/80">{pick.note}</p>
                </div>
              </div>
            </div>
          )}

          <h2 className="mb-5 font-display text-xl text-ink">{showPick ? "আরও বই" : "সব বই"}</h2>

          {books.length === 0 ? (
            <p className="font-body text-ink/50">
              {lang !== "all"
                ? `এই বিভাগে ${languagePhrase(lang)} ${showPick ? "আর কোনো " : "কোনো "}বই এখনো নেই।`
                : showPick
                  ? "এই বিভাগে আর কোনো বই নেই।"
                  : "এই বিভাগে এখনো কোনো বই নেই।"}
            </p>
          ) : (
            <>
              {grid}
              <Pager path={path} params={pagerParams} page={page} pages={pages} />
            </>
          )}
        </>
      )}
    </div>
  );
}
