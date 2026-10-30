// A Project Gutenberg book's generated HTML (cache/epub/N/pgN-images.html),
// made into the in-site reader's pages: a front page (title page, preface
// matter) and the chapters, each cleaned through the reader's allowlist
// (src/lib/reader/html.ts). Pure, so the on-demand fetch, the seed script
// and the tests share it.
//
// Gutenberg's licence (gutenberg.org/policy/license.html, read 2026-10-29):
// "If you strip the Project Gutenberg license and all references to Project
// Gutenberg from the text, you are left with a text unrestricted by U.S.
// intellectual property law." So the licence header and footer go, and so
// does any passage or link in the text that names Project Gutenberg; the
// reader credits them in its own colophon instead, with a link, which their
// licence says is not use of the trademark.
//
// Text only: images are left out (the contents page says so when a book had
// any). Chapters: the book's own chapter blocks (div.chapter) or its top
// heading level; a chapter over MAX_PAGE is split at its next heading level,
// and what is still too long, at paragraph breaks.
import { parseDocument, DomUtils } from "htmlparser2";
import render from "dom-serializer";
import { Element, isTag, isText, type ChildNode, type ParentNode } from "domhandler";
import sanitizeHtml from "sanitize-html";
import { ALLOWED_TAGS, DROP_TAGS, hidden, parseStyle, plainTag, READER_CLASSES, styleClasses } from "@/lib/reader/html";

// Bump when the rules change: stored books made under older rules are
// fetched and made again when next opened (and re-seeded by the workflow).
export const PARSER_VERSION = 1;

// Sizes of a page's HTML before cleaning.
const MAX_PAGE = 45_000;
const PART_TARGET = 28_000;
// Sections whose median size is under this are short notes, not chapters.
const PACK_BELOW = 5_000;
// A chapter whose own text is shorter than this, standing before others, is
// a part title ("PART II", "BOOK ONE: 1805"): it heads the chapters after it.
const TITLE_ONLY_TEXT = 200;
// Pieces this short before the first real chapter belong to the front page.
const FRONT_PIECE_TEXT = 600;

// Placeholder for the book's id in links between pages; the reader puts the
// id in when it shows a page, so a stored book doesn't depend on it.
export const BOOK_TOKEN = "__book__";

export type GutenbergPage = { label: string; group: string | null; html: string };
// `lang`: the language Gutenberg's catalogue gives the text ("en"), which a
// translation's or a mislabelled record's language in ours isn't.
export type GutenbergBook = { front: string; pages: GutenbergPage[]; images: number; lang: string | null };

// "Project Gutenberg", its trademark forms and its sites; also Distributed
// Proofreaders, which produced many of the books for it.
const GUTENBERG_MENTION = /project\s+gutenberg|gutenberg\s*(?:™|-tm\b)|gutenberg\.org|pglaf|pgdp\.net|distributed\s+proofread/i;
const GUTENBERG_LINK = /^(?:https?:)?\/\/(?:[a-z0-9-]+\.)*(?:gutenberg\.org|pglaf\.org|pgdp\.net)(?:[/:?#]|$)/i;
const BOILERPLATE_IDS = new Set(["pg-header", "pg-footer", "pg-start-separator", "pg-end-separator"]);
const SMALL_BLOCKS = new Set(["p", "li", "dd", "dt", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "caption", "td", "th", "pre", "blockquote", "div", "table", "ul", "ol", "dl"]);
const PAGE_NUMBER = /\b(page-?num(ber)?|pagenum|pageno|pgnum|pagenumber)\b/i;
const CONTENTS_TITLE = /^(table\s+of\s+)?contents\.?$|^list\s+of\s+illustrations\.?$|^illustrations\.?$/i;
const BYLINE = /^by\s/i;

const textOf = (nodes: ChildNode | ChildNode[]) => DomUtils.textContent(nodes).replace(/\s+/g, " ").trim();
const sizeOf = (nodes: ChildNode[]) => nodes.reduce((n, node) => n + render(node).length, 0);
const headingLevel = (n: ChildNode) => (isTag(n) && /^h[1-6]$/.test(n.name) ? Number(n.name[1]) : null);
const isChapterBox = (n: ChildNode) => isTag(n) && (n.name === "div" || n.name === "section") && /(^|\s)chapter(\s|$)/.test(n.attribs.class ?? "");
const blank = (n: ChildNode) => (isText(n) && !n.data.trim()) || n.type === "comment";
// An anchor-only element (<a id="x"></a>) or a rule between two headings.
const filler = (n: ChildNode) => blank(n) || (isTag(n) && (n.name === "hr" || n.name === "br" || ((n.name === "a" || n.name === "span" || n.name === "div") && !textOf(n))));

// ---- the book's own stylesheet ----

// Class -> declarations, from simple rules (".c", "p.c", "span.c, .d").
// Anything more specific is left alone: it only adds or loses a little
// formatting.
export function classStyles(css: string): Map<string, Record<string, string>> {
  const out = new Map<string, Record<string, string>>();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^{]*\{([\s\S]*?\})\s*\}/g, "");
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = parseStyle(m[2]);
    for (const selector of m[1].split(",")) {
      const sm = selector.trim().match(/^(?:[a-z0-9]+)?\.([a-z_][a-z0-9_-]*)$/i);
      if (!sm) continue;
      out.set(sm[1], { ...(out.get(sm[1]) ?? {}), ...decls });
    }
  }
  return out;
}

// ---- splitting ----

type Piece = { nodes: ChildNode[]; label: string | null; group: string | null };

// The element children (and any loose text) of a node.
function units(nodes: ChildNode[]): ChildNode[] {
  return nodes.filter((n) => !blank(n));
}

// A wrapper holding (nearly) the whole text (<div class="body">…) is looked
// inside; anything small beside it stays where it is.
function unwrap(list: ChildNode[]): ChildNode[] {
  let out = list;
  for (;;) {
    const total = sizeOf(out);
    const i = out.findIndex((n) => isTag(n) && ["div", "section", "article", "main"].includes(n.name) && !isChapterBox(n) && units(n.children).length >= 2 && render(n).length >= total * 0.9);
    if (i < 0) return out;
    out = [...out.slice(0, i), ...units((out[i] as Element).children), ...out.slice(i + 1)];
  }
}

// A note marker in a heading ("CHAPTER XVIII.[1]") isn't part of its title.
const NOTE_MARK = /^\[?[\d*†‡§]{1,3}\]?$/;
const noteMark = (n: ChildNode) => isTag(n) && (n.name === "sup" || (n.name === "a" && (n.attribs.href ?? "").startsWith("#"))) && NOTE_MARK.test(textOf(n));
function titleWords(n: ChildNode): string {
  if (isText(n)) return n.data;
  if (!isTag(n) || noteMark(n)) return "";
  return n.name === "br" ? " " : n.children.map(titleWords).join("");
}

// A heading's words; a heading set as a picture has them in the picture's
// alt text ("PREFACE.").
function headingText(n: ChildNode): string {
  const text = titleWords(n).replace(/\s+/g, " ").trim();
  if (text || !isTag(n)) return text;
  return DomUtils.findAll((e) => e.name === "img", [n])
    .map((img) => (img.attribs.alt ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

// The headings a piece starts with (several of the same level in a row are
// one title: "CHAPTER 1" then "TWO RUNAWAYS FROM LONESOME"), as one label. A
// deeper heading after them starts what they head.
function leadingTitle(nodes: ChildNode[]): { label: string | null; count: number } {
  const titles: string[] = [];
  let count = 0;
  let level: number | null = null;
  for (const n of nodes) {
    if (filler(n)) {
      count++;
      continue;
    }
    const l = headingLevel(n);
    if (l === null || (level !== null && l !== level)) break;
    level = l;
    const t = headingText(n);
    // An author's byline ("By Herman Melville") titles nothing.
    if (t && !BYLINE.test(t)) titles.push(t);
    count++;
  }
  return { label: titles.length ? titles.join(" — ").slice(0, 120) : null, count: titles.length ? count : 0 };
}

// Cuts `list` before each node `starts` matches; heading runs stay together.
function cut(list: ChildNode[], starts: (n: ChildNode) => boolean, group: string | null): Piece[] {
  const pieces: Piece[] = [{ nodes: [], label: null, group }];
  let prevStarted = false;
  for (const n of list) {
    const start = starts(n);
    if (start && !(prevStarted && headingLevel(n) !== null)) pieces.push({ nodes: [], label: null, group });
    pieces[pieces.length - 1].nodes.push(n);
    if (!filler(n)) prevStarted = start;
  }
  return pieces.filter((p) => p.nodes.some((n) => !filler(n)));
}

// The heading level the text is divided at: the highest one used at least twice.
function topLevel(list: ChildNode[], below = 0): number | null {
  const counts = new Map<number, number>();
  for (const n of list) {
    const l = headingLevel(n);
    if (l !== null && l > below) counts.set(l, (counts.get(l) ?? 0) + 1);
  }
  const levels = [...counts].filter(([, c]) => c >= 2).map(([l]) => l).sort((a, b) => a - b);
  return levels[0] ?? null;
}

// A piece's units, looking inside a chapter box.
const inside = (p: Piece) => (p.nodes.length === 1 && isChapterBox(p.nodes[0]) ? units((p.nodes[0] as Element).children) : p.nodes);

function labelled(p: Piece): Piece {
  return { ...p, label: leadingTitle(inside(p)).label ?? p.label };
}

// What follows a title that gets no page of its own (a subtitle, a motto)
// goes to the top of the next piece, under that piece's own title.
function carry(rest: ChildNode[], p: Piece): Piece {
  if (!textOf(rest)) return p;
  const inner = inside(p);
  const count = leadingTitle(inner).count;
  return { ...p, nodes: [...inner.slice(0, count), ...rest, ...inner.slice(count)] };
}
const afterTitle = (p: Piece) => inside(p).slice(leadingTitle(inside(p)).count);

// Pages of about PART_TARGET, cut at paragraph breaks; a single block too
// big for a page is looked inside.
function bySize(nodes: ChildNode[], label: string | null, group: string | null): Piece[] {
  const flat: ChildNode[] = [];
  for (const n of nodes) {
    if (isTag(n) && render(n).length > MAX_PAGE && units(n.children).length > 1 && !["table", "ul", "ol", "dl", "pre"].includes(n.name)) flat.push(...units(n.children));
    else flat.push(n);
  }
  const parts: ChildNode[][] = [[]];
  let size = 0;
  for (const n of flat) {
    const s = render(n).length;
    if (size > 0 && size + s > PART_TARGET && parts[parts.length - 1].some((x) => !filler(x))) {
      parts.push([]);
      size = 0;
    }
    parts[parts.length - 1].push(n);
    size += s;
  }
  // A short last part joins the one before it.
  if (parts.length > 1 && sizeOf(parts[parts.length - 1]) < PART_TARGET / 4) parts[parts.length - 2].push(...parts.pop()!);
  return parts.map((nodes) => ({ nodes, label, group }));
}

// A piece's contents, and the heading level below its own title that it
// would be split at (null: none, so it is split by size).
function sections(piece: Piece, depth: number): { inner: ChildNode[]; level: number | null } {
  const inner = unwrap(piece.nodes.length === 1 && isTag(piece.nodes[0]) ? units((piece.nodes[0] as Element).children) : piece.nodes);
  const lead = leadingTitle(inner);
  const own = Math.min(...inner.slice(0, lead.count).map((n) => headingLevel(n) ?? 9), 9);
  return { inner, level: depth < 3 ? topLevel(inner.slice(lead.count), own === 9 ? 0 : own) : null };
}

// Splits a piece that is over MAX_PAGE: at the next heading level inside it,
// else by size. Its title heads the pieces it becomes.
function shrink(piece: Piece, depth: number): Piece[] {
  if (sizeOf(piece.nodes) <= MAX_PAGE) return [piece];
  const { inner, level } = sections(piece, depth);
  if (level !== null) {
    let subs = cut(inner, (n) => headingLevel(n) === level, piece.label ?? piece.group).map(labelled);
    // The text before the first sub-heading keeps the piece's own title;
    // with nothing but that title, it adds nothing (the title heads the rest),
    // and a subtitle under it goes to the top of the first section.
    const opening = subs.length > 1 && headingLevel(subs[0].nodes.find((n) => !filler(n))!) !== level ? subs[0] : null;
    if (opening && opening.label === null) opening.label = piece.label;
    if (opening && titleOnly(opening)) subs.splice(0, 2, carry(afterTitle(opening), subs[1]));
    subs = subs.filter((s) => textOf(afterTitle(s)).length > 0);
    // Headings this close together mark short sections (marginal notes), not
    // chapters: they share pages.
    const sizes = subs.map((s) => sizeOf(s.nodes)).sort((a, b) => a - b);
    if (sizes.length && sizes[Math.floor(sizes.length / 2)] < PACK_BELOW) subs = pack(subs);
    return subs.flatMap((s) => shrink({ ...s, group: piece.label ?? piece.group }, depth + 1));
  }
  const parts = bySize(inner, piece.label, piece.group);
  // Outside any part, the section's title heads its parts in the contents
  // ("অংশ ১", "অংশ ২" under "INTRODUCTION").
  return parts.length === 1 ? parts : parts.map((p, i) => ({ ...p, label: piece.label ? `${piece.label} — অংশ ${bnDigits(i + 1)}` : null, group: piece.group ?? piece.label }));
}

// Consecutive pieces together up to PART_TARGET, under the first one's title.
function pack(pieces: Piece[]): Piece[] {
  const out: Piece[] = [];
  let size = 0;
  for (const p of pieces) {
    const s = sizeOf(p.nodes);
    const last = out[out.length - 1];
    if (last && size + s <= PART_TARGET) {
      last.nodes.push(...p.nodes);
      size += s;
    } else {
      out.push({ ...p, nodes: [...p.nodes] });
      size = s;
    }
  }
  return out;
}

const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

function chapters(list: ChildNode[]): { front: ChildNode[]; pieces: Piece[] } {
  // What stands before the first chapter (the title page, the book's own
  // contents) is the front page; the reader shows its own contents.
  let front: ChildNode[] = [];
  let pieces: Piece[];
  const startsChapter = list.filter(isChapterBox).length >= 2 ? isChapterBox : ((level) => (level === null ? null : (n: ChildNode) => headingLevel(n) === level))(topLevel(list));
  if (startsChapter === null) pieces = [{ nodes: list, label: null, group: null }];
  else {
    const first = list.findIndex(startsChapter);
    front = list.slice(0, first);
    pieces = cut(list.slice(first), startsChapter, null);
  }
  pieces = pieces.map(labelled);
  // Before the first real chapter: short pieces (the author's name, a
  // dedication; contents lists don't count), untitled ones, and contents
  // lists also go on the front page -- except a part title right before the
  // first chapter ("BOOK ONE: 1805"), which heads it. (Before a piece split
  // into sections under its own title, a lone title is the author's name.)
  let firstGroup: string | null = null;
  while (pieces.length > 1) {
    const p = pieces[0];
    const short = textOf(dropLinkLists(p.nodes)).length < FRONT_PIECE_TEXT;
    const untitled = p.label === null && pieces.some((q) => q.label !== null);
    if (!short && !untitled && !CONTENTS_TITLE.test(p.label ?? "")) break;
    pieces.shift();
    const next = pieces[0];
    const ownSections = next && next.label !== null && sizeOf(next.nodes) > MAX_PAGE && sections(next, 0).level !== null;
    if (p.label && !CONTENTS_TITLE.test(p.label) && titleOnly(p) && next && !titleOnly(next) && !ownSections) {
      firstGroup = p.label;
      pieces[0] = { ...carry(afterTitle(p), pieces[0]), group: firstGroup };
    } else front.push(...p.nodes);
  }
  // A long front (an introduction without a heading) is read as pages.
  front = dropLinkLists(front);
  if (sizeOf(front) > MAX_PAGE) {
    pieces.unshift({ nodes: front, label: "শুরুর অংশ", group: null });
    front = [];
  }

  // Part titles head the chapters after them.
  const out: Piece[] = [];
  let group: string | null = firstGroup;
  let rest: ChildNode[] = [];
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    if (CONTENTS_TITLE.test(p.label ?? "")) continue;
    if (p.label && titleOnly(p) && i < pieces.length - 1) {
      group = p.label;
      rest = afterTitle(p);
      continue;
    }
    out.push(...shrink({ ...carry(rest, p), group: group ?? p.group }, 0));
    rest = [];
  }
  return { front, pieces: out };
}

// A piece that is a title and next to nothing else: a part's title page.
function titleOnly(p: Piece): boolean {
  return textOf(afterTitle(p)).length < TITLE_ONLY_TEXT;
}

// ---- cleaning ----

// Removes the licence header and footer, and every passage that names
// Project Gutenberg: the smallest block around the mention, or the mention's
// own text when the block around it is a large one. Links to Gutenberg's
// sites keep their text and lose the link.
function stripGutenberg(root: Element) {
  for (const el of DomUtils.findAll((e) => BOILERPLATE_IDS.has(e.attribs.id ?? "") || /(^|\s)pg-boilerplate(\s|$)/.test(e.attribs.class ?? ""), root.children)) DomUtils.removeElement(el);
  for (const a of DomUtils.findAll((e) => e.name === "a" && GUTENBERG_LINK.test(e.attribs.href ?? ""), root.children)) {
    delete a.attribs.href;
  }
  const mentions = DomUtils.filter((n) => isText(n) && GUTENBERG_MENTION.test(n.data), root.children, true);
  for (const t of mentions) {
    if (!t.parent) continue;
    let block: ChildNode | null = null;
    for (let p: ParentNode | null = t.parent; p && p !== root; p = p.parent) {
      if (isTag(p) && SMALL_BLOCKS.has(p.name)) {
        if (textOf(p).length <= 3000) block = p;
        break;
      }
    }
    // A heading that names them heads their own section ("Preface to the
    // Project Gutenberg Etext"): the section goes with it.
    const level = block ? headingLevel(block) : null;
    if (block && level !== null && block.parent) {
      const box = block.parent;
      const first = units((box as Element).children).find((n) => !filler(n));
      if (box !== root && isChapterBox(box) && first === block) {
        DomUtils.removeElement(box);
        continue;
      }
      let next = block.next;
      while (next && !(headingLevel(next) !== null && headingLevel(next)! <= level) && !isChapterBox(next)) {
        const after = next.next;
        DomUtils.removeElement(next);
        next = after;
      }
    }
    DomUtils.removeElement(block ?? t);
  }
}

// Page numbers of the printed book ("{ix}") lose their text but keep their
// anchors, which an index or a contents list may link to.
function quietPageNumbers(root: Element) {
  for (const el of DomUtils.findAll((e) => PAGE_NUMBER.test(e.attribs.class ?? ""), root.children)) {
    delete el.attribs.class;
    for (const t of DomUtils.filter(isText, [el], true)) DomUtils.removeElement(t);
  }
}

// The book's own contents list on the front page: blocks whose text is
// mostly links within the book.
function dropLinkLists(nodes: ChildNode[]): ChildNode[] {
  return nodes.filter((n) => {
    if (!isTag(n)) return true;
    if (headingLevel(n) !== null && CONTENTS_TITLE.test(textOf(n))) return false;
    const text = textOf(n).length;
    if (text === 0) return true;
    const linked = DomUtils.findAll((e) => e.name === "a" && (e.attribs.href ?? "").startsWith("#"), [n]).reduce((s, a) => s + textOf(a).length, 0);
    return linked / text < 0.6;
  });
}

const DROP_MARK = "data-gb-drop";

function clean(html: string, css: Map<string, Record<string, string>>, images: { count: number }): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ["href", "target", "rel"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan"], ol: ["start", "type"], "*": ["class", "id", DROP_MARK] },
    allowedClasses: { "*": READER_CLASSES },
    allowedSchemes: ["https"],
    allowedSchemesByTag: { a: ["https"] },
    allowedSchemesAppliedToAttributes: ["href", "cite"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: [...DROP_TAGS],
    exclusiveFilter: (frame) => frame.attribs[DROP_MARK] === "1",
    nestingLimit: 120,
    transformTags: {
      "*": (tagName, attribs) => {
        if (DROP_TAGS.has(tagName)) return { tagName, attribs: {} };
        const drop = { tagName: "div", attribs: { [DROP_MARK]: "1" } };
        if (tagName === "img") {
          images.count++;
          return { tagName: "img", attribs: { [DROP_MARK]: "1" } };
        }
        const classes = (attribs.class ?? "").split(/\s+/).filter(Boolean);
        const style = { ...Object.assign({}, ...classes.map((c) => css.get(c) ?? {})), ...parseStyle(attribs.style) } as Record<string, string>;
        if (hidden(style) || classes.some((c) => PAGE_NUMBER.test(c))) return drop;
        const ours = styleClasses(tagName, style);
        if (classes.some((c) => /^(poem|poetry|stanza|verse)$/i.test(c))) ours.add("ws-poem");
        if (classes.some((c) => /^(center|c)$/i.test(c))) ours.add("ws-center");
        if (classes.some((c) => /^(smcap|smcaps|sc|smallcaps)$/i.test(c))) ours.add("ws-smallcaps");
        let name = plainTag(tagName, ours);
        const out: Record<string, string> = {};
        if (attribs.id && attribs.id.length <= 100 && !/\s/.test(attribs.id)) out.id = `gb-${attribs.id}`;
        if (name === "a") {
          const href = attribs.href ?? "";
          if (href.startsWith(`/books/${BOOK_TOKEN}/`) || href.startsWith("#gb-")) out.href = href;
          else if (/^https:\/\//i.test(href)) {
            out.href = href;
            out.target = "_blank";
            out.rel = "noopener noreferrer nofollow";
            ours.add("ws-external");
          } else name = "span";
        }
        if (name === "td" || name === "th") for (const span of ["colspan", "rowspan"] as const) if (/^\d{1,3}$/.test(attribs[span] ?? "")) out[span] = attribs[span];
        if (name === "ol") {
          if (/^\d{1,5}$/.test(attribs.start ?? "")) out.start = attribs.start;
          if (/^[1aAiI]$/.test(attribs.type ?? "")) out.type = attribs.type;
        }
        if (ours.size) out.class = [...ours].join(" ");
        return { tagName: name, attribs: out };
      },
    },
  }).trim();
}

// ---- the book ----

export function parseGutenbergHtml(raw: string): GutenbergBook {
  const doc = parseDocument(raw);
  const css = classStyles(DomUtils.findAll((e) => e.name === "style", doc.children).map((s) => DomUtils.textContent(s)).join("\n"));
  const body = DomUtils.findOne((e) => e.name === "body", doc.children, true);
  if (!body) throw new Error("no <body>");
  stripGutenberg(body);
  quietPageNumbers(body);
  // The book's own contents lists go wherever they stand: the reader has its
  // own contents, and the printed page numbers they point at are gone.
  const { front, pieces } = chapters(dropLinkLists(unwrap(units(body.children))));

  // Where each id is, for links between pages; then the links themselves.
  const pages = [front, ...pieces.map((p) => p.nodes)];
  const where = new Map<string, number>();
  pages.forEach((nodes, i) => {
    for (const el of DomUtils.findAll((e) => Boolean(e.attribs.id) || (e.name === "a" && Boolean(e.attribs.name)), nodes)) {
      if (!el.attribs.id && el.attribs.name) el.attribs.id = el.attribs.name;
      if (!where.has(el.attribs.id)) where.set(el.attribs.id, i);
    }
  });
  pages.forEach((nodes, i) => {
    for (const a of DomUtils.findAll((e) => e.name === "a" && e.attribs.href !== undefined, nodes)) {
      const href = a.attribs.href;
      const hash = href.indexOf("#");
      // Within the book: "#x", or the book's own file name with "#x".
      if (hash >= 0 && !/^[a-z]+:/i.test(href.slice(0, hash))) {
        const id = href.slice(hash + 1);
        const page = where.get(id);
        if (page === undefined || /\s/.test(id) || id.length > 100) delete a.attribs.href;
        else a.attribs.href = page === i ? `#gb-${id}` : `/books/${BOOK_TOKEN}/read${page ? `/${page}` : ""}#gb-${id}`;
      }
    }
  });

  // Each page without the heading the reader prints over it.
  const images = { count: 0 };
  const html = pieces.map((p) => {
    const inner = inside(p);
    const lead = leadingTitle(inner);
    // (Also over the first of the parts a long section is cut into.) Its ids
    // stay, as empty anchors: a link to the chapter, or back from a note
    // marked in its title, still lands.
    const strip = lead.label !== null && (lead.label === p.label || p.label?.startsWith(`${lead.label} — অংশ `));
    const anchors = strip ? DomUtils.findAll((e) => Boolean(e.attribs.id), inner.slice(0, lead.count)).map((e) => new Element("span", { id: e.attribs.id })) : [];
    const body = strip ? [...anchors, ...inner.slice(lead.count)] : inner;
    return clean(render(body), css, images);
  });
  const declared = DomUtils.findOne((e) => e.name === "html", doc.children, false)?.attribs.lang ?? DomUtils.findOne((e) => e.name === "meta" && e.attribs.name?.toLowerCase() === "dc.language", doc.children, true)?.attribs.content;
  return {
    front: clean(render(front), css, images),
    pages: pieces.map((p, i) => ({ label: p.label ?? `অংশ ${bnDigits(i + 1)}`, group: p.group, html: html[i] })),
    images: images.count,
    lang: declared && /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(declared.trim()) ? declared.trim().toLowerCase() : null,
  };
}

// For checks: anything left that names Project Gutenberg.
export const mentionsGutenberg = (html: string) => GUTENBERG_MENTION.test(html.replace(/<[^>]*>/g, " ")) || /gutenberg\.org|pglaf\.org/i.test(html);
