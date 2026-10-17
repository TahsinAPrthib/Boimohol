// Wikisource pages are written by anyone, so their HTML is untrusted. Before
// the reader shows a page it goes through a strict allowlist here, on the
// server:
//
// - only plain text-formatting tags survive (paragraphs, headings, lists,
//   tables, emphasis, links, images); scripts, styles, frames, forms, SVG,
//   MathML and media go, with everything inside them;
// - no inline styles and no event handlers: no attribute survives that isn't
//   listed below, and classes only from our own short list (a few of
//   Wikisource's layout hints -- centred, right-aligned, indented, poem --
//   are translated into those);
// - links within the work point at our reader, links to any other Wikisource
//   page point at bn.wikisource.org, and every other link becomes plain text;
// - images only from https://upload.wikimedia.org (thumb.wikimedia.org is
//   the same files under another name, and is rewritten to it);
// - ids are prefixed ("ws-") so a page can't shadow anything of ours.
//
// Wikisource's own page furniture -- the header, the previous/next bar, page
// numbers, licence boxes, edit links -- is removed too. The reader shows
// its own navigation and attribution.
import sanitizeHtml from "sanitize-html";
import { normalizeTitle, pathInWork, readerHref, titleFromWikiPath, WIKISOURCE_HOST, wikisourceUrl } from "./titles";

// Bump when the rules change: cached pages made under older rules are then
// fetched and cleaned again (src/lib/wikisource/reader.ts).
export const SANITIZER_VERSION = 1;

export type SanitizeContext = {
  bookId: string;
  root: string; // the work's main page
  current: string; // the page being cleaned
};

// An element to remove with everything inside it. Disallowed tags are
// skipped whole by their own name (nonTextTags below); anything else is
// marked with this attribute and cut out by exclusiveFilter. (Renaming a
// discarded element instead would leave sanitize-html holding the new name,
// which it then puts on the next closing tag at that depth.)
const DROP_MARK = "data-ws-drop";

const DROP_TAGS = new Set([
  "script", "style", "link", "meta", "base", "title", "head",
  "form", "input", "button", "select", "option", "optgroup", "textarea", "label", "fieldset", "output", "datalist",
  "iframe", "frame", "frameset", "object", "embed", "applet", "param", "portal",
  "noscript", "noembed", "noframes", "template", "slot", "xmp", "plaintext", "listing",
  "svg", "math", "canvas", "audio", "video", "source", "track", "picture", "map", "area",
  "dialog", "details", "summary", "menu", "marquee", "blink",
]);

// Wikisource's page furniture.
const DROP_CLASSES = new Set([
  "ws-noexport", "noprint", "mw-editsection", "licenseContainer", "licensetpl", "ws-pagenum", "pagenum",
  "wst-auxtoc", "wikisource-header-template", "headertemplate", "footertemplate", "mw-empty-elt",
  "searchbox", "mw-inputbox-centered", "Z3988", "metadata", "navbox", "catlinks", "sisitem", "mw-cite-backlink",
  "mw-references-wrap-hidden", "ws-data", "mw-indicators",
]);
const DROP_IDS = new Set(["headertemplate", "subheader", "ws-data", "footer", "catlinks"]);

// Wikisource class -> ours.
const CLASS_MAP: Record<string, string> = {
  "wst-center": "ws-center",
  center: "ws-center",
  "wst-block-center": "ws-block-center",
  "wst-right": "ws-right",
  "wst-left": "ws-left",
  poem: "ws-poem",
  "mw-poem-indented": "ws-poem-indent",
  "wst-dhr": "ws-gap",
  "wst-larger": "ws-big",
  "wst-x-larger": "ws-bigger",
  "wst-smaller": "ws-small",
  "wst-sc": "ws-smallcaps",
  smallcaps: "ws-smallcaps",
  references: "ws-references",
  reference: "ws-ref",
  "wst-rule": "ws-rule",
};

export const READER_CLASSES = [
  "ws-center", "ws-block-center", "ws-right", "ws-left", "ws-poem", "ws-poem-indent", "ws-gap",
  "ws-big", "ws-bigger", "ws-small", "ws-smallcaps", "ws-bold", "ws-italic", "ws-indent", "ws-indent-block",
  "ws-references", "ws-ref", "ws-rule", "ws-external",
];

const ALLOWED_TAGS = [
  "p", "br", "hr", "h2", "h3", "h4", "h5", "h6", "b", "strong", "i", "em", "u", "s", "sub", "sup", "small",
  "span", "div", "blockquote", "pre", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody", "tfoot",
  "tr", "th", "td", "caption", "a", "img", "figure", "figcaption", "abbr", "cite", "q",
];

function parseStyle(style: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of (style ?? "").split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    out[decl.slice(0, i).trim().toLowerCase()] = decl.slice(i + 1).trim().toLowerCase();
  }
  return out;
}

const size = (v: string | undefined) => {
  if (!v) return null;
  const pct = v.match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) return Number(pct[1]) / 100;
  const em = v.match(/^(\d+(?:\.\d+)?)(em|rem)$/);
  if (em) return Number(em[1]);
  return NAMED_SIZES[v] ?? null;
};
const NAMED_SIZES: Record<string, number> = { "x-small": 0.7, small: 0.85, smaller: 0.85, large: 1.2, larger: 1.2, "x-large": 1.5, "xx-large": 1.8 };
const positiveEm = (v: string | undefined) => !!v && /^\d+(\.\d+)?(em|rem|px)$/.test(v) && parseFloat(v) > 0;

// Images: upload.wikimedia.org over https, nothing else. Protocol-relative
// URLs (how MediaWiki writes them) are made https; thumb.wikimedia.org serves
// the same paths as upload.wikimedia.org.
export function imageSource(src: string | undefined): string | null {
  if (!src) return null;
  let url: URL;
  try {
    url = new URL(src.startsWith("//") ? `https:${src}` : src);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  if (url.hostname === "thumb.wikimedia.org") url.hostname = "upload.wikimedia.org";
  if (url.hostname !== "upload.wikimedia.org") return null;
  url.search = "";
  url.hash = "";
  return url.toString();
}

type Link = { href: string; external: boolean } | null;

// Where a link in a Wikisource page should go: into the reader, to
// Wikisource, a place on this page, or nowhere (null: the text stays, the
// link goes).
export function rewriteHref(href: string | undefined, ctx: SanitizeContext): Link {
  if (!href) return null;
  const raw = href.trim();
  if (raw.startsWith("#")) {
    const id = safeDecode(raw.slice(1));
    return id ? { href: `#ws-${encodeURIComponent(id)}`, external: false } : null;
  }
  let url: URL;
  try {
    url = new URL(raw, `https://${WIKISOURCE_HOST}/wiki/`);
  } catch {
    return null;
  }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.hostname !== WIKISOURCE_HOST || url.username || url.password || url.port) return null;
  // Only article links. Red links (/w/index.php?...&redlink=1), edit and
  // history links lead nowhere a reader needs.
  if (!url.pathname.startsWith("/wiki/") || url.search) return null;
  const title = titleFromWikiPath(url.pathname.slice("/wiki/".length));
  if (!title) return null;
  const fragment = url.hash ? safeDecode(url.hash.slice(1)) : null;
  const path = pathInWork(ctx.root, title);
  if (path !== null) {
    if (title === normalizeTitle(ctx.current) && fragment) return { href: `#ws-${encodeURIComponent(fragment)}`, external: false };
    return { href: readerHref(ctx.bookId, path, fragment ? `ws-${fragment}` : undefined), external: false };
  }
  return { href: wikisourceUrl(title, fragment ?? undefined), external: true };
}

function safeDecode(s: string): string | null {
  try {
    const d = decodeURIComponent(s);
    return d && d.length <= 200 && !/\s/.test(d) ? d : null;
  } catch {
    return null;
  }
}

export type Sanitized = { html: string; textLength: number };

export function sanitizeWikisourceHtml(raw: string, ctx: SanitizeContext): Sanitized {
  const html = sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding", "referrerpolicy"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      ol: ["start", "type"],
      "*": ["class", "id", DROP_MARK],
    },
    allowedClasses: { "*": READER_CLASSES },
    allowedSchemes: ["https"],
    allowedSchemesByTag: { a: ["https"], img: ["https"] },
    allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: [...DROP_TAGS],
    exclusiveFilter: (frame) => frame.attribs[DROP_MARK] === "1",
    nestingLimit: 120,
    transformTags: {
      "*": (tagName, attribs) => transform(tagName, attribs, ctx),
    },
  });
  return { html, textLength: html.replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim().length };
}

function transform(tagName: string, attribs: sanitizeHtml.Attributes, ctx: SanitizeContext): sanitizeHtml.Tag {
  if (DROP_TAGS.has(tagName)) return { tagName, attribs: {} };
  // An allowed tag, so exclusiveFilter sees it.
  const drop = { tagName: "div", attribs: { [DROP_MARK]: "1" } };
  const classes = (attribs.class ?? "").split(/\s+/).filter(Boolean);
  const style = parseStyle(attribs.style);
  if (classes.some((c) => DROP_CLASSES.has(c)) || DROP_IDS.has(attribs.id ?? "") || style.display === "none" || style.visibility === "hidden") return drop;

  const ours = new Set<string>();
  for (const c of classes) if (CLASS_MAP[c]) ours.add(CLASS_MAP[c]);
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

  let name = tagName;
  if (name === "h1") name = "h2";
  if (name === "center") {
    name = "div";
    ours.add("ws-center");
  }
  if (name === "big") {
    name = "span";
    ours.add("ws-big");
  }
  if (["font", "tt", "code", "kbd", "samp", "var", "ins", "mark", "time", "bdi", "bdo", "data", "nobr", "wbr"].includes(name)) name = "span";
  if (name === "strike" || name === "del") name = "s";
  if (name === "section" || name === "article" || name === "aside" || name === "main" || name === "header" || name === "footer" || name === "nav") name = "div";

  const out: Record<string, string> = {};
  if (attribs.id && attribs.id.length <= 100 && !/\s/.test(attribs.id)) out.id = `ws-${attribs.id}`;

  if (name === "a") {
    const link = rewriteHref(attribs.href, ctx);
    if (!link) name = "span";
    else {
      out.href = link.href;
      if (link.external) {
        out.target = "_blank";
        out.rel = "noopener noreferrer nofollow";
        ours.add("ws-external");
      }
    }
  }
  if (name === "img") {
    const src = imageSource(attribs.src);
    if (!src) return { tagName: "img", attribs: { [DROP_MARK]: "1" } };
    out.src = src;
    out.alt = (attribs.alt ?? "").slice(0, 300);
    for (const dim of ["width", "height"] as const) if (/^\d{1,4}$/.test(attribs[dim] ?? "")) out[dim] = attribs[dim];
    out.loading = "lazy";
    out.decoding = "async";
    out.referrerpolicy = "no-referrer";
  }
  if (name === "td" || name === "th") {
    for (const span of ["colspan", "rowspan"] as const) if (/^\d{1,3}$/.test(attribs[span] ?? "")) out[span] = attribs[span];
  }
  if (name === "ol") {
    if (/^\d{1,5}$/.test(attribs.start ?? "")) out.start = attribs.start;
    if (/^[1aAiI]$/.test(attribs.type ?? "")) out.type = attribs.type;
  }
  if (ours.size) out.class = [...ours].join(" ");
  return { tagName: name, attribs: out };
}

// ---- reading the raw page, before it is cleaned ----

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}
const plainText = (html: string) => decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();

// Links from a page to pages below `under` (the work's main page, or a
// section of it), in the order they appear, each once, with the link's text.
// MediaWiki writes its own markup, so a pattern over it is enough; the
// result names pages and labels only, and is never shown as HTML.
export function linksBelow(raw: string, under: string): { title: string; text: string }[] {
  const seen = new Set<string>();
  const out: { title: string; text: string }[] = [];
  for (const m of raw.matchAll(/<a\b[^>]*?\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeEntities(m[1]);
    if (!href.startsWith("/wiki/")) continue;
    const title = titleFromWikiPath(href.slice("/wiki/".length).split("#")[0]);
    if (!title || !title.startsWith(`${under}/`) || seen.has(title)) continue;
    seen.add(title);
    out.push({ title, text: plainText(m[2]) });
  }
  return out;
}

// The scans a page's text is transcluded from: each page-number marker
// names its scan page ("পাতা:মা - ... .pdf/১০").
export function scanFiles(raw: string): string[] {
  const files = new Set<string>();
  for (const m of raw.matchAll(/\bdata-page-name="([^"]+)"/g)) {
    const page = decodeEntities(m[1]);
    const file = page.match(/^(?:পাতা|Page):(.+)\/[^/]+$/)?.[1];
    if (file) files.add(normalizeTitle(file));
  }
  return [...files];
}
