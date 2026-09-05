import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCover from "@/components/ListingCover";
import ListingStatusControls from "@/components/ListingStatusControls";

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.user.id },
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
        <p className="font-body text-ink/50">আপনি এখনো কোনো তালিকা যোগ করেননি।</p>
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
                  <div>
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="font-display text-lg text-ink hover:text-cloth"
                    >
                      {listing.title}
                    </Link>
                    <p className="font-body text-sm text-ink/50">{listing.author}</p>
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

                <Link
                  href={`/marketplace/${listing.id}/edit`}
                  className="mt-2 inline-block font-body text-sm font-semibold text-cloth hover:underline"
                >
                  সম্পাদনা করুন
                </Link>

                <div className="mt-3">
                  <ListingStatusControls listingId={listing.id} currentStatus={listing.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
