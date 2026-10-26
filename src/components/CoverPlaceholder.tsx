import type { CSSProperties } from "react";
import CoverArt from "@/components/CoverArt";
import { coverDesign } from "@/lib/cover-design";

const graphemes = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("bn", { granularity: "grapheme" }) : null;

// The first whole letter as a reader sees it: for "গোরা" that is "গো", not a
// bare "গ" cut off from its vowel sign.
function initialGlyph(title: string) {
  // From the first letter or digit: "‘পার্টিসন’-প্রহেলিকা" starts at "পা", not
  // the quote mark, and "৺কৃত্তিবাসের…" at "কৃ".
  const trimmed = title.trim().replace(/^[^\p{L}\p{N}]+/u, "") || title.trim();
  if (trimmed.length === 0) return "বই";
  const first = graphemes?.segment(trimmed)[Symbol.iterator]().next();
  return first && !first.done ? first.value.segment : Array.from(trimmed)[0];
}

// A generated cover, never a hotlinked image. Books get their category's
// visual language, varied by their id (src/lib/cover-design.ts and
// CoverArt), so the books without a real cover read as one series;
// marketplace listings (ListingCover) and books without a category get the
// classic cloth cover. Colours come from the palette through CSS variables;
// layout, lettering and the small-size rules live in globals.css.
export default function CoverPlaceholder({
  title,
  author,
  colorKey = "cloth",
  className = "",
  seed,
  category,
  ornament = true,
}: {
  title: string;
  author: string;
  colorKey?: string;
  className?: string;
  // What makes this cover differ from its neighbours: the book's id.
  seed?: string;
  // The category's slug, which picks the visual language.
  category?: string | null;
  // False under a real cover image, where the generated cover is only the
  // fallback: its colours and title without the ornament, to keep pages light.
  ornament?: boolean;
}) {
  const design = coverDesign({ seed: seed ?? title, category, colorKey, title });

  return (
    <div
      className={`cover cover-gen relative flex aspect-[2/3] w-full flex-col overflow-hidden rounded-book shadow-shelf ${className}`}
      style={design.vars as CSSProperties}
      data-family={design.family}
      data-layout={design.layout}
      data-variant={design.variant}
      data-plate={design.plate || undefined}
      data-paper={design.paper || undefined}
      aria-hidden="true"
    >
      {ornament && <CoverArt design={design} />}

      {/* spine edge */}
      <div className="cover-spine absolute inset-y-0 left-0 shadow-spine" />

      {/* decorative frame, like a cloth-bound cover's blind-stamped border */}
      {design.family === "classic" && <div className="cover-frame pointer-events-none absolute rounded-[2px] border" />}

      <div className="cover-body relative flex min-h-0 flex-1 flex-col">
        <span className="cover-glyph font-display">{initialGlyph(title)}</span>

        <div className="cover-text">
          <p className="cover-title font-display" data-size={design.titleSize}>
            {title}
          </p>
          <p className="cover-author font-body">{author}</p>
        </div>
      </div>
    </div>
  );
}
