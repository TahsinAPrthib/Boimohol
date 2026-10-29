import CoverPlaceholder from "@/components/CoverPlaceholder";
import PriorityImage from "@/components/PriorityImage";
import { COVER_SIZES, coverSrcSet, coverUrl, type CoverContext } from "@/lib/covers";

// A book's cover: its real cover when it has one (a public-domain scan,
// src/lib/covers.ts), otherwise the generated cloth cover. Both sit in the
// same frame -- 2:3, the same radius, shelf shadow and spine shading -- so a
// shelf of mixed covers reads as one shelf.
//
// The generated cover is drawn underneath the image: if the image can't
// load, a broken image with empty alt text draws nothing and the generated
// cover shows through, with no script needed. The cover is decorative
// (the title is always written next to it), so the image has no alt text.
//
// The cover shows the Bangla title when the book has one, like the text
// under it on cards and the book page; English-only books keep their title.
export default function BookCover({
  bookId,
  categorySlug,
  title,
  titleBangla,
  author,
  colorKey = "cloth",
  className = "",
  coverPublicId = null,
  context = "card",
  priority = false,
}: {
  // The book's id and its category's slug pick the generated cover's design
  // (src/lib/cover-design.ts).
  bookId?: string;
  categorySlug?: string | null;
  title: string;
  titleBangla?: string | null;
  author: string;
  colorKey?: string;
  className?: string;
  coverPublicId?: string | null;
  context?: CoverContext;
  // The page's main image (the book page): fetched at once and first.
  // Everywhere else covers load lazily, as they scroll into view.
  priority?: boolean;
}) {
  const shownTitle = titleBangla?.trim() || title;
  const generated = { title: shownTitle, author, colorKey, seed: bookId, category: categorySlug };
  if (!coverPublicId) return <CoverPlaceholder {...generated} className={className} />;

  const { sizes, widths } = COVER_SIZES[context];
  // The home page's book of the day is its largest paint: from the site's own
  // address (src/lib/covers.ts).
  const sameSite = context === "today";
  const image = {
    src: coverUrl(coverPublicId, widths[1], sameSite),
    srcSet: coverSrcSet(coverPublicId, widths, sameSite),
    sizes,
    alt: "",
    loading: priority ? ("eager" as const) : ("lazy" as const),
    fetchPriority: priority ? ("high" as const) : ("auto" as const),
    // The page's main image is decoded with the page, so it is painted in the
    // first frame it can be; async decoding would let that frame go without it.
    decoding: priority ? ("auto" as const) : ("async" as const),
    className: "absolute inset-0 h-full w-full object-cover",
  };
  return (
    <div className={`cover relative aspect-[2/3] w-full overflow-hidden rounded-book bg-paper-dark shadow-shelf ${className}`} data-real-cover data-cover>
      {/* The page's main image comes first and at once, so it goes without
          the drawn cover underneath: laying out its title text (a container
          query, balanced and clamped lines) again when the fonts arrive held
          up the first paint. If it ever failed, the frame shows, and the
          title is written beside it. */}
      {!priority && (
        <div className="absolute inset-0">
          <CoverPlaceholder {...generated} ornament={false} />
        </div>
      )}
      {priority ? (
        <PriorityImage {...image} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Cloudinary sizes and formats it (src/lib/covers.ts); the image optimizer is off; alt is in `image`
        <img {...image} />
      )}
      {/* The spine edge, as on the generated covers. */}
      <div
        className="cover-spine pointer-events-none absolute inset-y-0 left-0 shadow-spine"
        style={{ background: "linear-gradient(90deg, rgba(42,36,32,0.35), rgba(42,36,32,0.12))" }}
        aria-hidden="true"
      />
    </div>
  );
}
