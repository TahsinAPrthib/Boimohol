const PALETTE: Record<string, { bg: string; bgLight: string; text: string }> = {
  cloth: { bg: "#253F54", bgLight: "#3A5D78", text: "#EAE3D3" },
  "cloth-light": { bg: "#3A5D78", bgLight: "#517594", text: "#EAE3D3" },
  oxblood: { bg: "#7C2D2D", bgLight: "#984040", text: "#EAE3D3" },
  turmeric: { bg: "#C68A1F", bgLight: "#D6A342", text: "#2A2420" },
  sage: { bg: "#5F7355", bgLight: "#78906B", text: "#EAE3D3" },
  ink: { bg: "#2A2420", bgLight: "#463C34", text: "#EAE3D3" },
};

const graphemes = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("bn", { granularity: "grapheme" }) : null;

// The first whole letter as a reader sees it: for "গোরা" that is "গো", not a
// bare "গ" cut off from its vowel sign.
function initialGlyph(title: string) {
  const trimmed = title.trim();
  if (trimmed.length === 0) return "বই";
  const first = graphemes?.segment(trimmed)[Symbol.iterator]().next();
  return first && !first.done ? first.value.segment : Array.from(trimmed)[0];
}

// Shared cover/spine placeholder — colored by category (or a caller-chosen
// default), styled like an actual cloth-bound cover, never a hotlinked
// image. Used by both BookCover (catalog books) and ListingCover
// (freeform marketplace listings, which may have no category).
export default function CoverPlaceholder({
  title,
  author,
  colorKey = "cloth",
  className = "",
}: {
  title: string;
  author: string;
  colorKey?: string;
  className?: string;
}) {
  const colors = PALETTE[colorKey] ?? PALETTE.cloth;

  return (
    <div
      className={`cover relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-book shadow-shelf ${className}`}
      style={{
        backgroundColor: colors.bg,
        backgroundImage: `linear-gradient(160deg, ${colors.bgLight} 0%, ${colors.bg} 55%)`,
      }}
      aria-hidden="true"
    >
      {/* spine edge */}
      <div className="cover-spine absolute inset-y-0 left-0 shadow-spine" style={{ backgroundColor: colors.bgLight }} />

      {/* decorative frame, like a cloth-bound cover's blind-stamped border */}
      <div
        className="cover-frame pointer-events-none absolute rounded-[2px] border"
        style={{ borderColor: `${colors.text}33` }}
      />

      <div className="cover-body relative flex min-h-0 flex-1 flex-col justify-between">
        <span
          className="cover-glyph font-display opacity-40"
          style={{ color: colors.text }}
        >
          {initialGlyph(title)}
        </span>

        <div className="cover-text">
          <p
            className="cover-title font-display"
            style={{ color: colors.text }}
          >
            {title}
          </p>
          <p
            className="cover-author font-body"
            style={{ color: `${colors.text}CC` }}
          >
            {author}
          </p>
        </div>
      </div>
    </div>
  );
}
