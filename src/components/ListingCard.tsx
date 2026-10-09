import Link from "next/link";
import { bnTaka } from "@/lib/bangla";
import ListingCover from "@/components/ListingCover";
import { cloudinaryUrl } from "@/lib/cloudinary-url";

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
  photoPublicId,
}: {
  id: string;
  title: string;
  author: string;
  colorKey?: string | null;
  listingType: "SELL" | "EXCHANGE" | "DONATE";
  price?: number | null;
  location: string;
  // First photo if the listing has one; otherwise the generated cover is used
  // so every card still renders something.
  photoPublicId?: string | null;
}) {
  return (
    <Link href={`/marketplace/${id}`} className="group flex flex-col">
      <div className="book-lift relative rounded-book">
        {photoPublicId ? (
          <div className="overflow-hidden rounded-book shadow-shelf">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryUrl(photoPublicId, { width: 400, square: true })}
              alt={title}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full object-cover"
            />
          </div>
        ) : (
          <ListingCover title={title} author={author} colorKey={colorKey} />
        )}
        <span
          className={`absolute right-2 top-2 rounded-book px-2 py-0.5 font-body text-xs font-semibold shadow-shelf ${TYPE_BADGE_CLASS[listingType]}`}
        >
          {TYPE_LABEL[listingType]}
          {listingType === "SELL" && price != null ? ` · ${bnTaka(price)}` : ""}
        </span>
      </div>
      <p className="mt-2 font-display text-base leading-snug text-ink group-hover:text-cloth">{title}</p>
      <p className="font-body text-xs text-ink/50">{author}</p>
      <p className="mt-1 font-body text-xs text-ink/60">{location}</p>
    </Link>
  );
}
