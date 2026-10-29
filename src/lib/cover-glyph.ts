const graphemes = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("bn", { granularity: "grapheme" }) : null;

// The first whole letter as a reader sees it: for "গোরা" that is "গো", not a
// bare "গ" cut off from its vowel sign. Shown on generated covers.
export function initialGlyph(title: string) {
  // From the first letter or digit: "‘পার্টিসন’-প্রহেলিকা" starts at "পা", not
  // the quote mark, and "৺কৃত্তিবাসের…" at "কৃ".
  const trimmed = title.trim().replace(/^[^\p{L}\p{N}]+/u, "") || title.trim();
  if (trimmed.length === 0) return "বই";
  const first = graphemes?.segment(trimmed)[Symbol.iterator]().next();
  return first && !first.done ? first.value.segment : Array.from(trimmed)[0];
}
