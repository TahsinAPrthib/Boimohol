import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { averageOf } from "@/lib/ratings";
import BookCover from "@/components/BookCover";
import BookCard from "@/components/BookCard";
import StarRating from "@/components/StarRating";

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      books: {
        include: { reviews: { select: { rating: true } } },
        orderBy: { title: "asc" },
      },
      starterPicks: {
        include: { book: { include: { reviews: { select: { rating: true } } } } },
        orderBy: { rank: "asc" },
        take: 1,
      },
    },
  });

  if (!category) notFound();

  const starterPick = category.starterPicks[0];
  const otherBooks = category.books.filter((b) => b.id !== starterPick?.bookId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 border-b-2 border-ink/10 pb-8">
        <h1 className="font-display text-3xl text-ink">{category.nameBangla}</h1>
        {category.description && (
          <p className="mt-2 max-w-prose font-body text-ink/70">{category.description}</p>
        )}
      </div>

      {starterPick && (
        <div className="mb-12 overflow-hidden rounded-book border-2 border-turmeric shadow-shelf">
          <div className="bg-turmeric px-5 py-2">
            <span className="font-display text-sm font-semibold text-ink/80">
              শুরু করুন এখান থেকে
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 bg-paper-dark p-6 sm:grid-cols-[160px_1fr]">
            <Link href={`/books/${starterPick.book.id}`} className="mx-auto w-full max-w-[160px] sm:mx-0">
              <BookCover
                title={starterPick.book.title}
                author={starterPick.book.author}
                colorKey={category.colorKey}
              />
            </Link>
            <div>
              <Link
                href={`/books/${starterPick.book.id}`}
                className="font-display text-2xl text-ink hover:text-cloth"
              >
                {starterPick.book.titleBangla || starterPick.book.title}
              </Link>
              <p className="mt-1 font-body text-ink/60">{starterPick.book.author}</p>
              <div className="mt-2">
                <StarRating value={averageOf(starterPick.book.reviews)} readOnly size="sm" />
              </div>
              <p className="mt-4 max-w-prose font-body text-ink/80">{starterPick.note}</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-5 font-display text-xl text-ink">{starterPick ? "আরও বই" : "সব বই"}</h2>

      {otherBooks.length === 0 ? (
        <p className="font-body text-ink/50">এই বিভাগে আর কোনো বই নেই।</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {otherBooks.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              titleBangla={book.titleBangla}
              author={book.author}
              colorKey={category.colorKey}
              averageRating={averageOf(book.reviews)}
              reviewCount={book.reviews.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
