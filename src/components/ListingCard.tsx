import Link from "next/link";
import ListingCover from "@/components/ListingCover";

const TYPE_LABEL: Record<string, string> = {
  SELL: "বিক্রি",
  EXCHANGE: "বিনিময়",
  DONATE: "দান",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  SELL: "bg-turmeric text-ink",
  EXCHANGE: "bg-cloth text-paper",
  DONATE: "bg-sage text-paper",
};

export default function ListingCard({
  id,
  title,
  author,
  colorKey,
  listingType,
  price,
  location,
}: {
  id: string;
  title: string;
  author: string;
  colorKey?: string | null;
  listingType: "SELL" | "EXCHANGE" | "DONATE";
  price?: number | null;
  location: string;
}) {
  return (
    <Link href={`/marketplace/${id}`} className="group flex flex-col">
      <div className="relative">
        <ListingCover title={title} author={author} colorKey={colorKey} />
        <span
          className={`absolute right-2 top-2 rounded-book px-2 py-0.5 font-body text-xs font-semibold shadow-shelf ${TYPE_BADGE_CLASS[listingType]}`}
        >
          {TYPE_LABEL[listingType]}
          {listingType === "SELL" && price != null ? ` · ৳${price}` : ""}
        </span>
      </div>
      <p className="mt-2 font-display text-base leading-snug text-ink group-hover:text-cloth">{title}</p>
      <p className="font-body text-xs text-ink/50">{author}</p>
      <p className="mt-1 font-body text-xs text-ink/60">{location}</p>
    </Link>
  );
}
