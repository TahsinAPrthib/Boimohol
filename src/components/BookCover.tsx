import CoverPlaceholder from "@/components/CoverPlaceholder";
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
  title,
  titleBangla,
  author,
  colorKey = "cloth",
  className = "",
  coverPublicId = null,
  context = "card",
  priority = false,
}: {
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
  if (!coverPublicId) return <CoverPlaceholder title={shownTitle} author={author} colorKey={colorKey} className={className} />;

  const { sizes, widths } = COVER_SIZES[context];
  return (
    <div className={`cover relative aspect-[2/3] w-full overflow-hidden rounded-book bg-paper-dark shadow-shelf ${className}`} data-real-cover>
      <div className="absolute inset-0">
        <CoverPlaceholder title={shownTitle} author={author} colorKey={colorKey} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary sizes and formats it (src/lib/covers.ts); the image optimizer is off */}
      <img
        src={coverUrl(coverPublicId, widths[1])}
        srcSet={coverSrcSet(coverPublicId, widths)}
        sizes={sizes}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* The spine edge, as on the generated covers. */}
      <div
        className="cover-spine pointer-events-none absolute inset-y-0 left-0 shadow-spine"
        style={{ background: "linear-gradient(90deg, rgba(42,36,32,0.35), rgba(42,36,32,0.12))" }}
        aria-hidden="true"
      />
    </div>
  );
}
