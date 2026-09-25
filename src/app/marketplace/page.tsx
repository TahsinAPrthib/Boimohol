import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import ListingCard from "@/components/ListingCard";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedSlug = searchParams.category;

  // Anonymous viewers see everything; a signed-in viewer doesn't see
  // listings from sellers they've blocked.
  const viewerId = await getSessionUserId();
  const blockedSellerIds = viewerId ? await blockedIdsFor(viewerId) : [];

  const listings = await prisma.listing.findMany({
    where: {
      status: "AVAILABLE",
      ...(selectedSlug ? { category: { slug: selectedSlug } } : {}),
      ...(blockedSellerIds.length > 0 ? { sellerId: { notIn: blockedSellerIds } } : {}),
    },
    include: {
      category: true,
      // Only the first photo is needed for the card.
      photos: { orderBy: { order: "asc" }, take: 1, select: { publicId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">বিনিময়</h1>
          <p className="mt-2 max-w-prose font-body text-ink/70">
            পাঠকদের হাতে হাতে বই বিক্রি, বিনিময় বা দান করার জায়গা।
          </p>
        </div>
        <Link href="/marketplace/new" className="btn-primary whitespace-nowrap">
          নতুন তালিকা যোগ করুন
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/marketplace"
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
            href={`/marketplace?category=${cat.slug}`}
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

      {listings.length === 0 ? (
        <p className="font-body text-ink/50">
          {selectedSlug ? "এই বিভাগে এখন কোনো তালিকা নেই।" : "এখনো কোনো তালিকা যোগ করা হয়নি।"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((listing) => (
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
      )}
    </div>
  );
}
