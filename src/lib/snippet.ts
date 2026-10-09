// Shortens free text for a preview card.
//
// Counts grapheme clusters rather than UTF-16 code units, so a cut never lands
// inside a Bangla conjunct or strands a vowel sign or hasanta. When there is a
// space reasonably close to the limit it backs up to it, so words stay whole.
const segmenter = new Intl.Segmenter("bn", { granularity: "grapheme" });

export function snippet(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const graphemes = Array.from(segmenter.segment(clean), (s) => s.segment);
  if (graphemes.length <= max) return clean;

  let cut = graphemes.slice(0, max).join("");
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > cut.length * 0.6) cut = cut.slice(0, lastSpace);
  return cut.replace(/[\s,;:।–—-]+$/, "") + "…";
}
