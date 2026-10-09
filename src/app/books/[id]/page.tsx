import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadBook } from "@/lib/loaders";
import { bn, bnFixed } from "@/lib/bangla";
import { withCallbackUrl } from "@/lib/safe-redirect";
import BookCover from "@/components/BookCover";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import ShelfButtons from "@/components/ShelfButtons";
import WishlistButton from "@/components/WishlistButton";
import BookDownloadButton from "@/components/BookDownloadButton";

export default async function BookPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const book = await loadBook(params.id);

  if (!book) notFound();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const reviewCount = book.reviews.length;
  const averageRating =
    reviewCount > 0 ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  const myReview = userId ? book.reviews.find((r) => r.userId === userId) ?? null : null;
  const freeFile = book.files[0] ?? null;

  let shelfStatus: "WANT" | "READING" | "FINISHED" | null = null;
  let wishlisted = false;
  if (userId) {
    const [shelfItem, wishlistItem] = await Promise.all([
      prisma.shelfItem.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
      }),
      prisma.wishlistItem.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
        select: { id: true },
      }),
    ]);
    shelfStatus = shelfItem?.status ?? null;
    wishlisted = wishlistItem !== null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_1fr]">
        <BookCover
          title={book.title}
          author={book.author}
          colorKey={book.category.colorKey}
          className="max-w-[200px]"
        />

        <div>
          <Link
            href={`/categories/${book.category.slug}`}
            className="font-body text-sm font-semibold text-cloth hover:underline"
          >
            {book.category.nameBangla}
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink">{book.titleBangla || book.title}</h1>
          {book.titleBangla && <p className="font-body text-ink/50">{book.title}</p>}
          <p className="mt-1 font-body text-ink/70">{book.author}</p>

          <div className="mt-3 flex items-center gap-2">
            <StarRating value={averageRating} readOnly />
            <span className="font-body text-sm text-ink/60">
              {reviewCount > 0
                ? `${bnFixed(averageRating)} (${bn(reviewCount)}টি পর্যালোচনা)`
                : "এখনো কোনো পর্যালোচনা নেই"}
            </span>
          </div>

          <p className="mt-4 max-w-prose font-body text-ink/80">{book.description}</p>

          {freeFile && freeFile.publicId && (
            <div className="mt-5 rounded-book border-2 border-sage/50 bg-sage/10 p-4">
              <BookDownloadButton
                fileId={freeFile.id}
                publicId={freeFile.publicId}
                fileSizeBytes={freeFile.fileSizeBytes}
              />
              {/* Being open about WHY a file is legally free is worth showing.
                  Understated, but present rather than buried. */}
              <p className="mt-3 max-w-prose font-body text-xs text-ink/60">
                <span className="font-semibold text-ink/70">কেন বিনামূল্যে:</span>{" "}
                {freeFile.rightsBasis}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col items-start gap-3">
            {userId && <ShelfButtons bookId={book.id} initialStatus={shelfStatus} />}
            <WishlistButton
              bookId={book.id}
              initialWishlisted={wishlisted}
              isLoggedIn={Boolean(userId)}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 border-t-2 border-ink/10 pt-8">
        {userId ? (
          <ReviewForm
            bookId={book.id}
            existingReview={
              myReview
                ? {
                    rating: myReview.rating,
                    text: myReview.text,
                    plotRating: myReview.plotRating,
                    writingRating: myReview.writingRating,
                    pacingRating: myReview.pacingRating,
                  }
                : null
            }
          />
        ) : (
          <div className="rounded-book border-2 border-dashed border-ink/15 px-4 py-5 text-center font-body text-ink/60">
            পর্যালোচনা লিখতে হলে{" "}
            <Link
              href={withCallbackUrl("/login", `/books/${book.id}`)}
              className="font-semibold text-cloth hover:underline"
            >
              লগইন
            </Link>{" "}
            করুন।
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl text-ink">পর্যালোচনাসমূহ</h2>
        {book.reviews.length === 0 ? (
          <p className="font-body text-ink/50">এখনো কেউ পর্যালোচনা লেখেননি।</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {book.reviews.map((review) => {
              const aspects = [
                review.plotRating != null ? `কাহিনি: ${bn(review.plotRating)}/৫` : null,
                review.writingRating != null ? `লেখনশৈলী: ${bn(review.writingRating)}/৫` : null,
                review.pacingRating != null ? `গতি: ${bn(review.pacingRating)}/৫` : null,
              ].filter((a): a is string => a !== null);

              return (
                <li key={review.id} className="rounded-book border-2 border-ink/10 bg-paper-dark p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body font-semibold text-ink">{review.user.name}</span>
                    <StarRating value={review.rating} readOnly size="sm" />
                  </div>
                  {aspects.length > 0 && (
                    <p className="mt-1 font-body text-xs text-ink/50">{aspects.join(" · ")}</p>
                  )}
                  {review.text && <p className="mt-2 font-body text-ink/70">{review.text}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
