import { getSessionUserId } from "@/lib/authz";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadListing } from "@/lib/loaders";
import { bnTaka, bnYear } from "@/lib/bangla";
import { withCallbackUrl } from "@/lib/safe-redirect";
import ListingCover from "@/components/ListingCover";
import ListingPhotoGallery from "@/components/ListingPhotoGallery";
import SafetyNotice from "@/components/SafetyNotice";
import ListingStatusControls from "@/components/ListingStatusControls";
import ContactSellerButton from "@/components/ContactSellerButton";
import ReportButton from "@/components/ReportButton";
import { ADMIN_REMOVED_NOTICE } from "@/lib/moderation";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "নতুন",
  LIKE_NEW: "প্রায় নতুন",
  GOOD: "ভালো",
  FAIR: "মোটামুটি",
  WORN: "পুরনো/জীর্ণ",
};

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

export default async function ListingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const listing = await loadListing(params.id);

  if (!listing) notFound();

  const userId = await getSessionUserId();
  const isSeller = userId === listing.sellerId;

  if (listing.status !== "AVAILABLE" && !isSeller) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">এই তালিকাটি আর উপলব্ধ নেই</h1>
        <p className="mt-2 font-body text-ink/60">
          বইটি হয়তো ইতিমধ্যে বিক্রি, বিনিময় বা দান হয়ে গেছে।
        </p>
        <Link href="/marketplace" className="btn-secondary mt-6 inline-flex">
          বিনিময় পাতায় ফিরে যান
        </Link>
      </div>
    );
  }

  const memberSinceYear = listing.seller.createdAt.getFullYear();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_1fr]">
        {listing.photos.length > 0 ? (
          <ListingPhotoGallery photos={listing.photos} title={listing.title} />
        ) : (
          <ListingCover
            title={listing.title}
            author={listing.author}
            colorKey={listing.category?.colorKey}
            className="max-w-[200px]"
          />
        )}

        <div>
          {listing.category && (
            <Link
              href={`/categories/${listing.category.slug}`}
              className="font-body text-sm font-semibold text-cloth hover:underline"
            >
              {listing.category.nameBangla}
            </Link>
          )}
          {/* Titles and authors are free text: a long unbroken word must wrap
              rather than push the page sideways. */}
          <h1 className="mt-1 font-display text-3xl text-ink [overflow-wrap:anywhere]">{listing.title}</h1>
          <p className="mt-1 font-body text-ink/70 [overflow-wrap:anywhere]">{listing.author}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 font-body text-sm text-ink/70">
            <span className="rounded-book bg-paper-dark px-2 py-1 font-semibold text-ink">
              {TYPE_LABEL[listing.listingType]}
            </span>
            <span className="rounded-book bg-paper-dark px-2 py-1">
              {CONDITION_LABEL[listing.condition]}
            </span>
            {listing.listingType === "SELL" && listing.price != null && (
              <span className="font-semibold text-ink">{bnTaka(listing.price)}</span>
            )}
          </div>

          <p className="mt-3 font-body text-ink/70">{listing.location}</p>

          {listing.description && (
            <p className="mt-4 max-w-prose font-body text-ink/80">{listing.description}</p>
          )}

          <p className="mt-4 font-body text-sm text-ink/60">
            বিক্রেতা: <span className="font-semibold text-ink">@{listing.seller.username}</span>
            {" · "}সদস্য হয়েছেন {bnYear(memberSinceYear)} থেকে
          </p>

          {isSeller ? (
            <div className="mt-6">
              <p className="mb-2 font-body text-sm font-semibold text-ink/70">
                বর্তমান অবস্থা: {STATUS_LABEL[listing.status]}
              </p>
              {listing.removedByAdminAt ? (
                <p className="rounded-book border-2 border-oxblood/40 bg-oxblood/10 px-3 py-2 font-body text-sm text-oxblood">
                  {ADMIN_REMOVED_NOTICE}
                </p>
              ) : (
                <>
                  <ListingStatusControls listingId={listing.id} currentStatus={listing.status} />
                  <Link
                    href={`/marketplace/${listing.id}/edit`}
                    className="mt-3 inline-block font-body text-sm font-semibold text-cloth hover:underline"
                  >
                    তালিকাটি সম্পাদনা করুন
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              {userId ? (
                <ContactSellerButton listingId={listing.id} />
              ) : (
                <Link
                  href={withCallbackUrl("/login", `/marketplace/${listing.id}`)}
                  className="btn-primary self-start"
                >
                  লগইন করে বার্তা পাঠান
                </Link>
              )}
              <SafetyNotice />
              {userId && (
                <ReportButton targetType="LISTING" targetId={listing.id} label="এই তালিকাটি রিপোর্ট করুন" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
