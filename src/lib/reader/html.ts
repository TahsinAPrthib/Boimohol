// What the in-site reader allows in a book's text, shared by its two
// sources: Wikisource pages (src/lib/wikisource/sanitize.ts) and Project
// Gutenberg books (src/lib/gutenberg/parse.ts). Plain text-formatting tags
// only, no inline styles, and classes only from READER_CLASSES (styled in
// globals.css under .reader-text): a source's own layout hints -- centred,
// right-aligned, indented, small capitals -- are translated into those.

export const READER_CLASSES = [
  "ws-center", "ws-block-center", "ws-right", "ws-left", "ws-poem", "ws-poem-indent", "ws-gap",
  "ws-big", "ws-bigger", "ws-small", "ws-smallcaps", "ws-bold", "ws-italic", "ws-indent", "ws-indent-block",
  "ws-references", "ws-ref", "ws-rule", "ws-external",
];

export const ALLOWED_TAGS = [
  "p", "br", "hr", "h2", "h3", "h4", "h5", "h6", "b", "strong", "i", "em", "u", "s", "sub", "sup", "small",
  "span", "div", "blockquote", "pre", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody", "tfoot",
  "tr", "th", "td", "caption", "a", "img", "figure", "figcaption", "abbr", "cite", "q",
];

// Removed with everything inside them.
export const DROP_TAGS = new Set([
  "script", "style", "link", "meta", "base", "title", "head",
  "form", "input", "button", "select", "option", "optgroup", "textarea", "label", "fieldset", "output", "datalist",
  "iframe", "frame", "frameset", "object", "embed", "applet", "param", "portal",
  "noscript", "noembed", "noframes", "template", "slot", "xmp", "plaintext", "listing",
  "svg", "math", "canvas", "audio", "video", "source", "track", "picture", "map", "area",
  "dialog", "details", "summary", "menu", "marquee", "blink",
]);

export function parseStyle(style: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of (style ?? "").split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    out[decl.slice(0, i).trim().toLowerCase()] = decl.slice(i + 1).trim().toLowerCase();
  }
  return out;
}

const NAMED_SIZES: Record<string, number> = { "x-small": 0.7, small: 0.85, smaller: 0.85, large: 1.2, larger: 1.2, "x-large": 1.5, "xx-large": 1.8 };
const size = (v: string | undefined) => {
  if (!v) return null;
  const pct = v.match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) return Number(pct[1]) / 100;
  const em = v.match(/^(\d+(?:\.\d+)?)(em|rem)$/);
  if (em) return Number(em[1]);
  return NAMED_SIZES[v] ?? null;
};
const positiveEm = (v: string | undefined) => !!v && /^\d+(\.\d+)?(em|rem|px)$/.test(v) && parseFloat(v) > 0;

// A style that hides the element: it is removed with its contents.
export const hidden = (style: Record<string, string>) => style.display === "none" || style.visibility === "hidden";

// Our classes for an element's declared style (inline, or its classes' rules
// in the source's stylesheet).
export function styleClasses(tagName: string, style: Record<string, string>): Set<string> {
  const ours = new Set<string>();
  if (style["text-align"] === "center") ours.add("ws-center");
  if (style["text-align"] === "right") ours.add("ws-right");
  const fontSize = size(style["font-size"]);
  if (fontSize !== null && fontSize >= 1.4) ours.add("ws-bigger");
  else if (fontSize !== null && fontSize >= 1.1) ours.add("ws-big");
  else if (fontSize !== null && fontSize <= 0.9) ours.add("ws-small");
  if (style["font-weight"] === "bold" || Number(style["font-weight"]) >= 600) ours.add("ws-bold");
  if (style["font-style"] === "italic") ours.add("ws-italic");
  if (style["font-variant"] === "small-caps") ours.add("ws-smallcaps");
  // The usual paragraph indent: an empty inline-block span a few ems wide.
  if (tagName === "span" && style.display === "inline-block" && positiveEm(style.width)) ours.add("ws-indent");
  if ((tagName === "div" || tagName === "p") && [style["margin-left"], style["margin-inline-start"], style["padding-left"]].some(positiveEm)) ours.add("ws-indent-block");
  if (tagName === "span" && positiveEm(style["margin-inline-start"] ?? style["margin-left"])) ours.add("ws-poem-indent");
  return ours;
}

// Old and semantic tags the reader shows as plain ones; `ours` gains the
// class an old tag stood for.
export function plainTag(tagName: string, ours: Set<string>): string {
  if (tagName === "h1") return "h2";
  if (tagName === "center") {
    ours.add("ws-center");
    return "div";
  }
  if (tagName === "big") {
    ours.add("ws-big");
    return "span";
  }
  if (["font", "tt", "code", "kbd", "samp", "var", "ins", "mark", "time", "bdi", "bdo", "data", "nobr", "wbr"].includes(tagName)) return "span";
  if (tagName === "strike" || tagName === "del") return "s";
  if (["section", "article", "aside", "main", "header", "footer", "nav"].includes(tagName)) return "div";
  return tagName;
}
