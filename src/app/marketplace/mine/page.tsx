import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { withCallbackUrl } from "@/lib/safe-redirect";
import ListingCover from "@/components/ListingCover";
import ListingStatusControls from "@/components/ListingStatusControls";
import { ADMIN_REMOVED_NOTICE } from "@/lib/moderation";

const TYPE_LABEL: Record<string, string> = {
  SELL: "বিক্রি",
  EXCHANGE: "বিনিময়",
  DONATE: "দান",
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "উপলব্ধ",
  RESERVED: "রিজার্ভড",
  COMPLETED: "সম্পন্ন",
  REMOVED: "সরিয়ে ফেলা হয়েছে",
};

export default async function MyListingsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect(withCallbackUrl("/login", "/marketplace/mine"));

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between border-b-2 border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-ink">আমার বিনিময় তালিকা</h1>
        <Link href="/marketplace/new" className="btn-primary whitespace-nowrap">
          নতুন তালিকা
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="font-body text-ink/70">আপনি এখনো কোনো তালিকা যোগ করেননি।</p>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="grid grid-cols-1 gap-4 rounded-book border-2 border-ink/10 bg-paper-dark p-4 sm:grid-cols-[96px_1fr]"
            >
              <ListingCover
                title={listing.title}
                author={listing.author}
                colorKey={listing.category?.colorKey}
                className="max-w-[96px]"
              />
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 [overflow-wrap:anywhere]">
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="font-display text-lg text-ink hover:text-cloth"
                    >
                      {listing.title}
                    </Link>
                    <p className="font-body text-sm text-ink/70">{listing.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-book bg-paper px-2 py-1 font-body text-xs font-semibold text-ink/70">
                      {TYPE_LABEL[listing.listingType]}
                    </span>
                    <span className="rounded-book bg-paper px-2 py-1 font-body text-xs font-semibold text-ink/70">
                      {STATUS_LABEL[listing.status]}
                    </span>
                  </div>
                </div>

                {listing.removedByAdminAt ? (
                  <p className="mt-3 rounded-book border-2 border-oxblood/40 bg-oxblood/10 px-3 py-2 font-body text-sm text-oxblood">
                    {ADMIN_REMOVED_NOTICE}
                  </p>
                ) : (
                  <>
                    <Link
                      href={`/marketplace/${listing.id}/edit`}
                      className="mt-2 inline-block font-body text-sm font-semibold text-cloth hover:underline"
                    >
                      সম্পাদনা করুন
                    </Link>

                    <div className="mt-3">
                      <ListingStatusControls listingId={listing.id} currentStatus={listing.status} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
