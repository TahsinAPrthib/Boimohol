import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";
import BookCard from "@/components/BookCard";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedSlug = searchParams.category;

  // Only books that actually carry a free file. rightsVerified is part of the
  // filter as well as the type: a row is only ever written with it true after
  // the public-domain gate passes, so this keeps the public list honest even if
  // a row were ever created some other way.
  const books = await prisma.book.findMany({
    where: {
      ...(selectedSlug ? { category: { slug: selectedSlug } } : {}),
      files: { some: { type: "FREE", rightsVerified: true } },
    },
    include: {
      category: { select: { colorKey: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 border-b-2 border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-ink">লাইব্রেরি</h1>
        <p className="mt-2 max-w-prose font-body text-ink/70">
          পাবলিক ডোমেইনের বই — যেগুলোর কপিরাইটের মেয়াদ শেষ হয়ে গেছে, তাই যে কেউ বিনামূল্যে পড়তে
          ও নামাতে পারেন।
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-ink/10 pb-6">
        <Link
          href="/library"
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
            href={`/library?category=${cat.slug}`}
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

      {books.length === 0 ? (
        <p className="rounded-book border-2 border-dashed border-ink/15 px-4 py-6 text-center font-body text-ink/60">
          {selectedSlug
            ? "এই বিভাগে এখনো কোনো বিনামূল্যের বই নেই।"
            : "লাইব্রেরিতে এখনো কোনো বই যোগ করা হয়নি। শিগগিরই আসছে।"}
        </p>
      ) : (
        <>
          <p className="mb-4 font-body text-sm text-ink/50">
            {bn(books.length)}টি বই পড়ার জন্য প্রস্তুত।
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                titleBangla={book.titleBangla}
                author={book.author}
                colorKey={book.category.colorKey}
                averageRating={
                  book.reviews.length
                    ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length
                    : 0
                }
                reviewCount={book.reviews.length}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
