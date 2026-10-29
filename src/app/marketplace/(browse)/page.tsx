import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import ListingCard from "@/components/ListingCard";
import SearchBox from "@/components/SearchBox";
import ChipRow from "@/components/ChipRow";
import ExchangeSwitch from "@/components/ExchangeSwitch";
import NoResults from "@/components/NoResults";
import { hrefWith, readQuery, searchFilter } from "@/lib/search";

export default async function MarketplacePage(props: {
  searchParams: Promise<{ category?: string; q?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedSlug = searchParams.category;
  const q = readQuery(searchParams.q);
  const search = searchFilter(q);

  // Anonymous viewers see everything; a signed-in viewer doesn't see
  // listings from sellers they've blocked.
  const viewerId = await getSessionUserId();
  const blockedSellerIds = viewerId ? await blockedIdsFor(viewerId) : [];

  const listings = await prisma.listing.findMany({
    where: {
      status: "AVAILABLE",
      ...(selectedSlug ? { category: { slug: selectedSlug } } : {}),
      ...(blockedSellerIds.length > 0 ? { sellerId: { notIn: blockedSellerIds } } : {}),
      ...search,
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
      <ExchangeSwitch active="listings" />
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">বিনিময়</h1>
          <p className="mt-2 max-w-prose font-body text-ink/70">
            পাঠকদের হাতে হাতে বই বিক্রি, বিনিময় বা দান করার জায়গা।
          </p>
        </div>
        <Link href="/marketplace/new" className="btn-primary whitespace-nowrap max-lg:hidden">
          নতুন তালিকা যোগ করুন
        </Link>
      </div>

      <SearchBox label="বিনিময়ের বই খুঁজুন" placeholder="বইয়ের নাম, লেখক বা এলাকা" className="mb-4" />

      <ChipRow as="nav" label="বিভাগ" activeKey={selectedSlug ?? ""} className="mb-6">
        <Link
          href={hrefWith("/marketplace", { q })}
          aria-current={!selectedSlug ? "true" : undefined}
          className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold max-lg:flex max-lg:min-h-11 max-lg:shrink-0 max-lg:items-center max-lg:whitespace-nowrap ${
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
            href={hrefWith("/marketplace", { category: cat.slug, q })}
            aria-current={selectedSlug === cat.slug ? "true" : undefined}
            className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold max-lg:flex max-lg:min-h-11 max-lg:shrink-0 max-lg:items-center max-lg:whitespace-nowrap ${
              selectedSlug === cat.slug
                ? "border-cloth bg-cloth text-paper"
                : "border-ink/20 text-ink hover:border-ink/40"
            }`}
          >
            {cat.nameBangla}
          </Link>
        ))}
      </ChipRow>

      {listings.length === 0 && search ? (
        <NoResults query={q} where={selectedSlug ? "এই বিভাগে" : undefined} />
      ) : listings.length === 0 ? (
        <p className="font-body text-ink/70">
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
