import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";
import { getSessionUserId } from "@/lib/authz";
import { withCallbackUrl } from "@/lib/safe-redirect";
import { getWishlistMatches } from "@/actions/wishlist";
import BookCard from "@/components/BookCard";
import ListingCard from "@/components/ListingCard";

function averageOf(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export default async function WishlistPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect(withCallbackUrl("/login", "/wishlist"));

  const [items, matches] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: { select: { colorKey: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getWishlistMatches(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 border-b-2 border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-ink">উইশলিস্ট</h1>
        <p className="mt-2 max-w-prose font-body text-ink/70">
          যে বইগুলো পড়তে চান সেগুলো এখানে রাখুন। কেউ সেগুলোর কোনোটি বিনিময়ে দিলে উপরে দেখাবে।
        </p>
      </div>

      {/* Matches first — the whole point of keeping a wishlist is that it
          tells you when something you want shows up. */}
      <section className="mb-12">
        <h2 className="mb-1 font-display text-2xl text-ink">পাওয়া যাচ্ছে</h2>
        <p className="mb-4 font-body text-sm text-ink/60">
          আপনার উইশলিস্টের বইয়ের সাথে মিলে যাওয়া বিনিময়ের তালিকা।
        </p>

        {matches.length === 0 ? (
          <p className="rounded-book border-2 border-dashed border-ink/15 px-4 py-5 font-body text-sm text-ink/50">
            {items.length === 0
              ? "উইশলিস্টে বই যোগ করলে এখানে মিল দেখানো হবে।"
              : "এই মুহূর্তে আপনার উইশলিস্টের কোনো বই বিনিময়ে নেই। পরে আবার দেখুন।"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {matches.map((match) => (
              <div key={match.listingId}>
                <ListingCard
                  id={match.listingId}
                  title={match.listingTitle}
                  author={match.listingAuthor}
                  colorKey={match.colorKey}
                  listingType={match.listingType}
                  price={match.price}
                  location={match.location}
                  photoPublicId={match.photoPublicId}
                />
                <p className="mt-1 font-body text-xs text-ink/40">
                  মিলেছে: {match.matchedBookTitle}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl text-ink">
          আমার উইশলিস্ট{items.length > 0 ? ` (${bn(items.length)})` : ""}
        </h2>

        {items.length === 0 ? (
          <p className="font-body text-ink/50">
            উইশলিস্ট খালি। কোনো বইয়ের পাতায় গিয়ে “উইশলিস্টে রাখুন”-এ চাপ দিন —{" "}
            <Link href="/categories" className="font-semibold text-cloth hover:underline">
              বিভাগ থেকে শুরু করুন
            </Link>
            ।
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <BookCard
                key={item.id}
                id={item.book.id}
                title={item.book.title}
                titleBangla={item.book.titleBangla}
                author={item.book.author}
                colorKey={item.book.category.colorKey}
                averageRating={averageOf(item.book.reviews)}
                reviewCount={item.book.reviews.length}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
