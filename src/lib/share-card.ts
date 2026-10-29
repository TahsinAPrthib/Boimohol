import { readFile } from "node:fs/promises";
import path from "node:path";
import { isValidElement, type ReactNode } from "react";
import CoverArt from "@/components/CoverArt";
import { coverDesign, type CoverDesign } from "@/lib/cover-design";
import { initialGlyph } from "@/lib/cover-glyph";
import type { CardFields } from "@/lib/share";

// A book's link-preview card (1200 x 630, the size Facebook and X show
// largest): its cover standing on the shelf board, its title and author
// beside it, and the wordmark. Drawn as SVG, rendered by resvg, sent as JPEG.
//
// Text is shaped by HarfBuzz (harfbuzzjs) and drawn as glyph outlines: no
// SVG renderer shapes Bangla right on its own (resvg places conjuncts and
// vowel signs wrongly, and so does next/og). The fonts are the site's own,
// from assets/fonts.

const W = 1200;
const H = 630;
const INK = "#2A2420";
const CLOTH = "#253F54";
const PAPER = "#EAE3D3";
const BOARD = "#3A2F26";
const BOARD_EDGE = "#5B4A3B";

// ---- fonts and shaping

type FontName = "tiro" | "hind" | "hindSemi" | "hindBold";
const FONT_FILES: Record<FontName, string> = {
  tiro: "TiroBangla-Regular.ttf",
  hind: "HindSiliguri-Regular.ttf",
  hindSemi: "HindSiliguri-SemiBold.ttf",
  hindBold: "HindSiliguri-Bold.ttf",
};

type Hb = typeof import("harfbuzzjs");
type Face = { hb: Hb; font: InstanceType<Hb["Font"]>; upem: number; ascender: number; descender: number; paths: Map<number, string> };
let faces: Promise<Record<FontName, Face>> | null = null;

// Loaded once per server process; a glyph's outline is kept once drawn.
function loadFaces(): Promise<Record<FontName, Face>> {
  faces ??= (async () => {
    const hb = await import("harfbuzzjs");
    const entries = await Promise.all(
      (Object.keys(FONT_FILES) as FontName[]).map(async (name) => {
        const data = await readFile(path.join(process.cwd(), "assets", "fonts", FONT_FILES[name]));
        const face = new hb.Face(new hb.Blob(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)));
        const font = new hb.Font(face);
        const { ascender, descender } = font.hExtents();
        return [name, { hb, font, upem: face.upem, ascender, descender, paths: new Map() }] as const;
      })
    );
    return Object.fromEntries(entries) as Record<FontName, Face>;
  })();
  return faces;
}

type Shaped = { width: number; glyphs: { d: string; x: number; y: number }[]; scale: number };

function shape(face: Face, text: string, size: number): Shaped {
  const { hb } = face;
  const buffer = new hb.Buffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(face.font, buffer);
  const infos = buffer.getGlyphInfos();
  const positions = buffer.getGlyphPositions();
  const scale = size / face.upem;
  const glyphs: Shaped["glyphs"] = [];
  let pen = 0;
  infos.forEach((info, i) => {
    const gid = info.codepoint;
    let d = face.paths.get(gid);
    if (d === undefined) {
      d = face.font.glyphToPath(gid);
      face.paths.set(gid, d);
    }
    const p = positions[i];
    if (d) glyphs.push({ d, x: (pen + p.xOffset) * scale, y: -p.yOffset * scale });
    pen += p.xAdvance;
  });
  return { width: pen * scale, glyphs, scale };
}

// One shaped line with its baseline at (x, y).
function drawLine(s: Shaped, x: number, y: number): string {
  return s.glyphs
    .map((g) => `<path transform="translate(${r2(x + g.x)} ${r2(y + g.y)}) scale(${s.scale} ${-s.scale})" d="${g.d}"/>`)
    .join("");
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const graphemes = new Intl.Segmenter("bn", { granularity: "grapheme" });

// Lines as the site sets them: breaks at spaces, balanced (text-wrap:
// balance), a word too long for any line broken between letters
// (overflow-wrap: break-word), and past the last allowed line an ellipsis
// (-webkit-line-clamp).
export function wrapText(measure: (s: string) => number, text: string, maxWidth: number, maxLines: number): string[] {
  const words: string[] = [];
  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    if (measure(word) <= maxWidth) {
      words.push(word);
      continue;
    }
    let piece = "";
    for (const { segment } of graphemes.segment(word)) {
      if (piece && measure(piece + segment) > maxWidth) {
        words.push(piece);
        piece = segment;
      } else piece += segment;
    }
    if (piece) words.push(piece);
  }
  const greedy = (width: number) => {
    const lines: string[] = [];
    for (const word of words) {
      const last = lines[lines.length - 1];
      if (last !== undefined && measure(`${last} ${word}`) <= width) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
    }
    return lines;
  };
  const full = greedy(maxWidth);
  if (full.length > maxLines) {
    const kept = full.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 0 && measure(`${last}…`) > maxWidth) last = [...graphemes.segment(last)].slice(0, -1).map((g) => g.segment).join("").trimEnd();
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  // The narrowest width that still needs no more lines.
  let lo = 0;
  let hi = maxWidth;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (greedy(mid).length <= full.length) hi = mid;
    else lo = mid;
  }
  return greedy(hi);
}

// A block of text: lines of `size` px in `lineHeight`, aligned in a box of
// `width` from `x`, the first line box's top at `y`. Returns the SVG and
// its height.
function textBlock(face: Face, lines: string[], o: { x: number; y: number; width: number; size: number; lineHeight: number; align: "start" | "center" | "end"; fill: string; opacity?: number }) {
  const lh = o.size * o.lineHeight;
  // Half-leading, as CSS places the baseline in its line box.
  const ascent = (face.ascender / face.upem) * o.size;
  const content = ((face.ascender - face.descender) / face.upem) * o.size;
  const baseline = (lh - content) / 2 + ascent;
  const body = lines
    .map((line, i) => {
      const s = shape(face, line, o.size);
      const x = o.align === "start" ? o.x : o.align === "center" ? o.x + (o.width - s.width) / 2 : o.x + o.width - s.width;
      return drawLine(s, x, o.y + i * lh + baseline);
    })
    .join("");
  return { svg: `<g fill="${o.fill}"${o.opacity !== undefined ? ` opacity="${o.opacity}"` : ""}>${body}</g>`, height: lines.length * lh };
}

// ---- the generated cover

// CoverArt is a tree of SVG elements; its markup, with the cover's colours
// in place of the CSS variables it is painted with in the browser.
const ATTR_KEEP = new Set(["viewBox", "preserveAspectRatio"]);
function svgMarkup(node: ReactNode, colours: Record<string, string>): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((n) => svgMarkup(n, colours)).join("");
  if (!isValidElement(node)) return "";
  const { type } = node;
  const props = node.props as Record<string, unknown> & { children?: ReactNode };
  if (typeof type === "function") return svgMarkup((type as (p: unknown) => ReactNode)(props), colours);
  if (typeof type !== "string") return svgMarkup(props.children, colours);
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== "children" && k !== "className" && !k.startsWith("aria-") && v !== undefined && v !== null && v !== false)
    .map(([k, v]) => {
      const name = ATTR_KEEP.has(k) ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      const value = String(v).replace(/currentColor/g, colours.currentColor).replace(/var\((--cv-[a-z]+)\)/g, (_, n: string) => colours[n] ?? "none");
      return ` ${name}="${value.replace(/"/g, "&quot;")}"`;
    })
    .join("");
  return `<${type}${attrs}>${svgMarkup(props.children, colours)}</${type}>`;
}

// The cover is laid out at the width the CSS caps its type at (171px, where
// every min(..rem, ..cqw) equals its cqw), then scaled: the same design,
// larger. The numbers mirror .cover-gen in src/app/globals.css: change both.
const CW = 171;
const CH = CW * 1.5;
const U = CW / 100; // 1cqw
type Pad = [number, number, number, number]; // top right bottom left, in cqw
const PAD: Record<string, Pad> = {
  classic: [9.4, 9.4, 9.4, 14],
  poetry: [20, 16, 20, 19],
  novel: [24, 14, 24, 17],
  essay: [12, 12, 12, 16],
  thriller: [11, 10, 11, 15],
  scifi: [11, 10, 11, 15],
  selfhelp: [14, 12, 14, 15],
  history: [88, 11, 10, 15],
  stories: [12, 11, 12, 15],
  drama: [25, 21, 22, 24],
  children: [34, 14, 38, 17],
  myth: [80, 12, 11, 15],
  travel: [12, 11, 12, 15],
};
const TITLE: Record<CoverDesign["titleSize"], { size: number; lineHeight: number; lines: number }> = {
  xs: { size: 21, lineHeight: 1.3, lines: 2 },
  s: { size: 16.5, lineHeight: 1.3, lines: 3 },
  m: { size: 13, lineHeight: 1.33, lines: 4 },
  l: { size: 10.5, lineHeight: 1.375, lines: 5 },
  xl: { size: 9.2, lineHeight: 1.38, lines: 6 },
};
const FLEURON =
  '<path d="M30 2l6 6-6 6-6-6z"/><path d="M4 8h14M42 8h14" fill="none" stroke-width="1.6" stroke-linecap="round"/><circle cx="21.5" cy="8" r="2"/><circle cx="38.5" cy="8" r="2"/>';

function linearGradient(id: string, deg: number, w: number, h: number, stops: [string, number][]): string {
  // CSS angles: 0deg points up, 90deg right; the line spans the box's corners.
  const a = (deg * Math.PI) / 180;
  const [dx, dy] = [Math.sin(a), -Math.cos(a)];
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const [cx, cy] = [w / 2, h / 2];
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r2(cx - dx * half)}" y1="${r2(cy - dy * half)}" x2="${r2(cx + dx * half)}" y2="${r2(cy + dy * half)}">${stops
    .map(([c, o]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("")}</linearGradient>`;
}

// The generated cover in its own 171 x 256.5 box.
function generatedCover(f: Record<FontName, Face>, book: CardFields): string {
  const title = book.titleBangla?.trim() || book.title;
  const d = coverDesign({ seed: book.id, category: book.category.slug, colorKey: book.category.colorKey, title });
  const v = d.vars;
  const [bg, light, text, orn, acc] = [v["--cv-bg"], v["--cv-light"], v["--cv-text"], v["--cv-orn"], v["--cv-acc"]];
  const family = d.family;
  const out: string[] = [];

  // Cloth: the light falling across the board, and a faint weave.
  out.push(
    `<defs>${linearGradient("cv-light", d.paper ? 170 : 160, CW, CH, [[light, 0], [bg, d.paper ? 0.7 : 0.55]])}` +
      `<pattern id="cv-weave" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="1" height="3" fill="#fff" fill-opacity=".03"/><rect width="3" height="1" fill="#000" fill-opacity=".045"/></pattern></defs>`,
    `<rect width="${CW}" height="${CH}" fill="url(#cv-light)"/>`
  );
  if (!d.paper) out.push(`<rect width="${CW}" height="${CH}" fill="url(#cv-weave)"/>`);
  else out.push(`<rect x=".5" y=".5" width="${CW - 1}" height="${CH - 1}" fill="none" stroke="${INK}" stroke-opacity=".14"/>`);

  // The ornament, as CoverArt draws it.
  const art = CoverArt({ design: d });
  if (art) {
    const inner = svgMarkup((art.props as { children: ReactNode }).children, { currentColor: orn, "--cv-acc": acc, "--cv-orn": orn, "--cv-text": text });
    out.push(`<svg width="${CW}" height="${CH}" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none" stroke="${orn}">${inner}</svg>`);
  }

  // The spine.
  out.push(`<rect width="8" height="${CH}" fill="${d.paper ? INK : light}"${d.paper ? ' fill-opacity=".09"' : ""}/>`);
  out.push(spineShade(8, CH));
  if (family === "classic") out.push(`<rect x="${7 * U}" y="${7 * U}" width="${CW - 14 * U}" height="${CH - 14 * U}" rx="2" fill="none" stroke="${text}" stroke-opacity=".2"/>`);

  // Padding, with the family's and the variant's exceptions.
  const [pt0, pr, pb0, pl] = PAD[family] ?? PAD.classic;
  let [pt, pb] = [pt0, pb0];
  if (family === "poetry" && d.layout === "top-c") pt = 24;
  if (family === "essay" && d.variant === 0) pt = 36;
  if (family === "essay" && d.variant === 1) pb = 34;
  if (family === "stories") {
    if (d.layout === "low") pt = 64;
    else pb = 50;
  }
  const box = { top: pt * U, bottom: CH - pb * U, left: pl * U, width: CW - (pl + pr) * U };

  // The text block: title, author, and the family's frame for them.
  const sans = family === "thriller" || family === "scifi";
  const t = TITLE[d.titleSize];
  const titleFace = sans ? f.hindBold : f.tiro;
  const titleSize = t.size * U;
  const titleLh = sans ? 1.3 : t.lineHeight;
  const plate = d.plate && family === "novel";
  const card = family === "children";
  const [padY, padX] = plate ? [4.5 * U + 1, 4 * U + 1] : card ? [7 * U, 5 * U] : [0, 0];
  const innerW = box.width - 2 * padX;
  const titleLines = wrapText((s) => shape(titleFace, s, titleSize).width, title, innerW, t.lines);
  const authorSize = 7 * U;
  const authorLines = wrapText((s) => shape(f.hind, s, authorSize).width, book.author, innerW, 2);
  const fleuron = family === "poetry" ? 5.5 * U + 3.5 * U : 0;
  const authorGap = family === "essay" ? 6 * U : 2.3 * U;
  const blockH = 2 * padY + fleuron + titleLines.length * titleSize * titleLh + authorGap + authorLines.length * authorSize * 1.333;
  const justify = d.layout === "mid" ? "center" : d.layout === "top" || d.layout === "top-c" ? "start" : "end";
  const top = justify === "start" ? box.top : justify === "center" ? box.top + (box.bottom - box.top - blockH) / 2 : box.bottom - blockH;
  const align = d.layout === "top-c" || d.layout === "mid" || d.layout === "low-c" ? "center" : "start";
  const ink = card ? INK : text;

  const block: string[] = [];
  // The novel's label: a ruled plate, with a second rule just outside it.
  if (plate) {
    const o = Math.min(3, 1.6 * U) + 1;
    block.push(
      `<rect x="${box.left + 0.5}" y="${top + 0.5}" width="${box.width - 1}" height="${blockH - 1}" fill="#000" fill-opacity=".16" stroke="${orn}"/>`,
      `<rect x="${box.left - o + 0.5}" y="${top - o + 0.5}" width="${box.width + 2 * o - 1}" height="${blockH + 2 * o - 1}" fill="none" stroke="${orn}"/>`
    );
  }
  // The children's book's paper card (border-radius 20% 24% 22% 26% / 26% 22% 28% 24%).
  if (card) {
    const [w, h, x0, y0] = [box.width, blockH, box.left, top];
    const [tl, tr, br, bl] = [[0.2 * w, 0.26 * h], [0.24 * w, 0.22 * h], [0.22 * w, 0.28 * h], [0.26 * w, 0.24 * h]].map(([a, b]) => [r2(a), r2(b)]);
    const d0 = `M${x0 + tl[0]} ${y0}H${x0 + w - tr[0]}A${tr[0]} ${tr[1]} 0 0 1 ${x0 + w} ${y0 + tr[1]}V${y0 + h - br[1]}A${br[0]} ${br[1]} 0 0 1 ${x0 + w - br[0]} ${y0 + h}H${x0 + bl[0]}A${bl[0]} ${bl[1]} 0 0 1 ${x0} ${y0 + h - bl[1]}V${y0 + tl[1]}A${tl[0]} ${tl[1]} 0 0 1 ${x0 + tl[0]} ${y0}Z`;
    block.push(`<path d="${d0}" transform="translate(0 1)" fill="${INK}" fill-opacity=".25"/><path d="${d0}" fill="#F6F1E6"/>`);
  }
  let y = top + padY;
  if (fleuron) {
    const fw = 20 * U;
    block.push(`<g fill="${orn}" stroke="${orn}" transform="translate(${r2(box.left + (box.width - fw) / 2)} ${r2(y + (5.5 * U - (16 * fw) / 60) / 2)}) scale(${r2(fw / 60)})">${FLEURON}</g>`);
    y += fleuron;
  }
  const titleBlock = textBlock(titleFace, titleLines, { x: box.left + padX, y, width: innerW, size: titleSize, lineHeight: titleLh, align, fill: ink });
  block.push(titleBlock.svg);
  y += titleBlock.height;
  if (family === "essay") block.push(`<rect x="${box.left}" y="${r2(y + 3 * U)}" width="${r2(12 * U)}" height="1" fill="${orn}"/>`);
  y += authorGap;
  block.push(textBlock(f.hind, authorLines, { x: box.left + padX, y, width: innerW, size: authorSize, lineHeight: 1.333, align, fill: ink, opacity: 0.8 }).svg);
  // The card is set a little askew, title and all.
  const tilt = card ? parseFloat(v["--cv-tilt"] ?? "0") : 0;
  out.push(tilt ? `<g transform="rotate(${tilt} ${r2(box.left + box.width / 2)} ${r2(top + blockH / 2)})">${block.join("")}</g>` : block.join(""));

  // The initial: at the head of the classic cover, in the cameo on history's.
  const glyph = initialGlyph(title);
  if (family === "classic") {
    out.push(textBlock(f.tiro, [glyph], { x: box.left, y: box.top, width: box.width, size: 17.5 * U, lineHeight: 1, align: "start", fill: text, opacity: 0.4 }).svg);
  } else if (family === "history") {
    const size = 24 * U;
    out.push(textBlock(f.tiro, [glyph], { x: 0, y: CH * 0.36 - size / 2, width: CW, size, lineHeight: 1, align: "center", fill: orn, opacity: 0.9 }).svg);
  }
  return `<rect width="${CW}" height="${CH}" fill="${bg}"/>${out.join("")}`;
}

// The spine's inset shadow (2px 0 4px, shadow / 0.25).
function spineShade(w: number, h: number): string {
  return `<rect width="${w}" height="${h}" fill="url(#spine-shade)"/>`;
}

// ---- the card

const COVER_W = 300;
const COVER_H = 450;
// The card's title: [px, most lines], tried in turn.
const TITLE_STEPS = [
  [76, 2],
  [64, 3],
  [52, 3],
  [44, 4],
] as const;

async function realCoverDataUri(publicId: string): Promise<string | null> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return null;
  try {
    // JPEG, which every renderer reads; twice the drawn width.
    const res = await fetch(`https://res.cloudinary.com/${cloud}/image/upload/f_jpg,q_auto,c_lfill,ar_2:3,g_center,w_${COVER_W * 2}/${publicId}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/jpeg")) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

// `complete` is false when the book's real cover couldn't be fetched and its
// generated cover stands in: such a card shouldn't be cached for long.
export async function bookCardSvg(book: CardFields): Promise<{ svg: string; complete: boolean }> {
  const f = await loadFaces();
  const image = book.coverPublicId ? await realCoverDataUri(book.coverPublicId) : null;
  const name = book.titleBangla?.trim() || book.title;

  const boardTop = 548;
  const coverX = 112;
  const coverY = boardTop + 14 + 8 - COVER_H;
  const scale = COVER_W / CW;
  const cover = image
    ? `<image href="${image}" width="${COVER_W}" height="${COVER_H}" preserveAspectRatio="xMidYMid slice"/>` +
      `<rect width="${14}" height="${COVER_H}" fill="url(#real-spine)"/>${spineShade(14, COVER_H)}`
    : `<g transform="scale(${scale})">${generatedCover(f, book)}</g>`;

  // The text column: the category, the title as large as it fits (76px on
  // two lines down to 44px on four, with an ellipsis past that), the author,
  // and the wordmark at the foot.
  const colX = coverX + COVER_W + 72;
  const colW = W - colX - 80;
  let size = 0;
  let titleLines: string[] = [];
  for (const [s, lines] of TITLE_STEPS) {
    size = s;
    titleLines = wrapText((t) => shape(f.tiro, t, s).width, name, colW, lines);
    if (!titleLines[titleLines.length - 1].endsWith("…")) break;
  }
  const authorLines = wrapText((s) => shape(f.hind, s, 32).width, book.author, colW, 2);
  const labelH = 26 * 1.3;
  const titleH = titleLines.length * size * 1.22;
  const blockH = labelH + 14 + titleH + 18 + authorLines.length * 32 * 1.35;
  const textTop = Math.max(70, (boardTop - 70 - blockH) / 2 + 10);
  const parts = [
    textBlock(f.hindSemi, [book.category.nameBangla], { x: colX, y: textTop, width: colW, size: 26, lineHeight: 1.3, align: "start", fill: CLOTH }).svg,
    textBlock(f.tiro, titleLines, { x: colX, y: textTop + labelH + 14, width: colW, size, lineHeight: 1.22, align: "start", fill: INK }).svg,
    textBlock(f.hind, authorLines, { x: colX, y: textTop + labelH + 14 + titleH + 18, width: colW, size: 32, lineHeight: 1.35, align: "start", fill: INK, opacity: 0.75 }).svg,
    textBlock(f.tiro, ["বই মহল"], { x: colX, y: boardTop - 92, width: colW, size: 48, lineHeight: 1.2, align: "end", fill: CLOTH }).svg,
  ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${INK}" fill-opacity=".05"/></pattern>
<linearGradient id="board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BOARD_EDGE}"/><stop offset=".4" stop-color="${BOARD}"/></linearGradient>
<linearGradient id="real-spine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity=".35"/><stop offset="1" stop-color="${INK}" stop-opacity=".12"/></linearGradient>
<linearGradient id="spine-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity=".25"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
<clipPath id="cover-clip"><rect width="${COVER_W}" height="${COVER_H}" rx="${3 * scale}"/></clipPath>
<filter id="lift" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="16" flood-color="${INK}" flood-opacity=".38"/><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${INK}" flood-opacity=".3"/></filter>
<filter id="board-shadow" x="-5%" y="-100%" width="110%" height="400%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="${INK}" flood-opacity=".5"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>
<rect y="${boardTop}" width="${W}" height="14" fill="url(#board)" filter="url(#board-shadow)"/>
<g transform="translate(${coverX} ${coverY})"><rect width="${COVER_W}" height="${COVER_H}" rx="${3 * scale}" fill="${PAPER}" filter="url(#lift)"/><g clip-path="url(#cover-clip)">${cover}</g></g>
${parts.join("\n")}
</svg>`;
  return { svg, complete: !book.coverPublicId || image !== null };
}

// A JPEG: WhatsApp shows no preview for an image over about 300 KB, and a
// card with a scanned cover comes to nearly that as a PNG. Full-colour
// chroma keeps the lettering crisp.
export async function renderJpeg(svg: string): Promise<Buffer> {
  const [{ Resvg }, { default: sharp }] = await Promise.all([import("@resvg/resvg-js"), import("sharp")]);
  const png = new Resvg(svg, { font: { loadSystemFonts: false }, fitTo: { mode: "original" } }).render().asPng();
  return sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}
