// The generated covers as one series: each category has its own visual
// language (src/components/CoverArt.tsx), and each book a variation of it
// chosen from its id -- so neighbouring books on a shelf differ, while a
// given book always looks the same, on the server and in the browser.
// Pure and dependency-free.

export type CoverFamily =
  | "classic"
  | "novel"
  | "poetry"
  | "thriller"
  | "scifi"
  | "selfhelp"
  | "history"
  | "essay"
  | "stories"
  | "drama"
  | "travel"
  | "children"
  | "myth";

// Category slug -> visual language. Books in a category not listed here, and
// marketplace listings, get the classic cloth cover.
export const FAMILY_BY_CATEGORY: Record<string, CoverFamily> = {
  uponnash: "novel",
  kobita: "poetry",
  "thriller-rohosso": "thriller",
  "biggan-kolpokahini": "scifi",
  atmounnoyon: "selfhelp",
  "itihash-jiboni": "history",
  probondho: "essay",
  chhotogolpo: "stories",
  natok: "drama",
  bhromon: "travel",
  "shishu-sahitto": "children",
  "puran-lokkotha": "myth",
};

// Where the title sits: top / middle / bottom, aligned to the start or centred.
export type CoverLayout = "top" | "top-c" | "mid" | "low" | "low-c";

type Family = {
  // Picked from the book's seed -- or, with byVariant, the one that goes
  // with the ornament (a band at the foot needs the title at the head).
  layouts: CoverLayout[];
  byVariant?: boolean;
  // Most lines the title may take, where an ornament takes the rest.
  lines?: number;
  // Share of the cover's width the title can use, for sizing it.
  width: number;
  // The title in a plate (a label on the cloth).
  plate?: boolean;
  // Essays are printed on paper rather than cloth.
  paper?: boolean;
  // Set in bold Hind rather than Tiro Bangla (wider letters).
  sans?: boolean;
};

const FAMILIES: Record<CoverFamily, Family> = {
  classic: { layouts: ["low"], width: 0.7 },
  novel: { layouts: ["top-c", "mid", "top-c"], width: 0.56, plate: true, lines: 4 },
  poetry: { layouts: ["mid", "mid", "top-c"], width: 0.62 },
  thriller: { layouts: ["top", "low", "top"], width: 0.72, sans: true },
  scifi: { layouts: ["top", "top-c", "low"], width: 0.72, sans: true },
  selfhelp: { layouts: ["top-c", "top", "top-c"], width: 0.68 },
  history: { layouts: ["low-c"], width: 0.68, lines: 3 },
  essay: { layouts: ["top", "top", "low"], byVariant: true, width: 0.7, paper: true },
  stories: { layouts: ["top", "low", "top-c"], width: 0.7 },
  drama: { layouts: ["mid"], width: 0.54, lines: 5 },
  travel: { layouts: ["low", "top", "low"], width: 0.7 },
  children: { layouts: ["mid"], width: 0.57, plate: true, lines: 4 },
  myth: { layouts: ["low-c"], width: 0.66, lines: 3 },
};

// The palette tokens (tailwind.config.ts) per category colour: the cloth,
// a lighter cloth for the light side and spine, the lettering, and the
// stamped ornament (gold on dark cloth, ink on turmeric).
const PALETTE: Record<string, { bg: string; light: string; text: string; accent: string }> = {
  cloth: { bg: "#253F54", light: "#3A5D78", text: "#EAE3D3", accent: "#D6A342" },
  "cloth-light": { bg: "#3A5D78", light: "#517594", text: "#EAE3D3", accent: "#E2B860" },
  oxblood: { bg: "#7C2D2D", light: "#984040", text: "#EAE3D3", accent: "#E2B860" },
  turmeric: { bg: "#C68A1F", light: "#D6A342", text: "#2A2420", accent: "#7C2D2D" },
  sage: { bg: "#5F7355", light: "#78906B", text: "#EAE3D3", accent: "#E2B860" },
  ink: { bg: "#2A2420", light: "#463C34", text: "#EAE3D3", accent: "#C68A1F" },
};
const PAPER = { bg: "#EFE8DA", light: "#F6F1E6", text: "#2A2420" };

// FNV-1a: a stable 32-bit hash of the book's id.
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32: a small seeded generator, so every number a cover draws from
// comes out the same each time.
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * factor))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// ---- titles

const graphemes = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("bn", { granularity: "grapheme" }) : null;
const split = (s: string) => (graphemes ? [...graphemes.segment(s)].map((g) => g.segment) : Array.from(s));

// How wide a vowel sign or other mark makes its letter, in em: a sign in
// front of the letter (ে ি), after it (া ী), or both (ো ৌ) adds its own
// width; signs below (ু ূ ৃ) add none. Measured on Tiro Bangla.
// Keyed by code point: a lone combining sign in source is easy to misread.
const MARK_EM = new Map<number, number>([
  [0x09be, 0.32], // aa-kar
  [0x09bf, 0.28], // i-kar
  [0x09c0, 0.28], // ii-kar
  [0x09c7, 0.32], // e-kar
  [0x09c8, 0.38], // ai-kar
  [0x09cb, 0.64], // o-kar
  [0x09cc, 0.7], // au-kar
  [0x0982, 0.3], // anusvara
  [0x0983, 0.25], // visarga
  [0x09cd, 0.1], // hasant: a conjunct is a little wider than one letter
]);

// The width of one grapheme (a letter with its signs) in em.
export function graphemeEm(g: string): number {
  const first = g.codePointAt(0) ?? 0;
  let w: number;
  if (first >= 0x0985 && first <= 0x0994) w = first === 0x0986 ? 0.95 : 0.85; // অ আ ই ... ঔ
  else if (first >= 0x0995 && first <= 0x09ef) w = 0.6; // letters and digits
  else if (/[A-Z]/.test(g)) w = 0.68;
  else if (/[a-z0-9]/.test(g)) w = 0.5;
  else w = 0.4; // punctuation
  for (const ch of Array.from(g).slice(1)) w += MARK_EM.get(ch.codePointAt(0) ?? 0) ?? 0;
  return w;
}

const wordEm = (word: string) => split(word).reduce((sum, g) => sum + graphemeEm(g), 0);
const SPACE_EM = 0.28;
// Bold Hind runs a little wider than Tiro Bangla.
const SANS_FACTOR = 1.08;

export type TitleSize = "xs" | "s" | "m" | "l" | "xl";

// Font size (in % of the cover's width) and the most lines each size may take.
const SIZES: { size: TitleSize; em: number; lines: number }[] = [
  { size: "xs", em: 21, lines: 2 },
  { size: "s", em: 16.5, lines: 3 },
  { size: "m", em: 13, lines: 4 },
  { size: "l", em: 10.5, lines: 5 },
  { size: "xl", em: 9.2, lines: 6 },
];

// The largest size at which the title's longest word fits on one line and
// the whole title in that size's lines, wrapping at spaces. A title too long
// for every size gets the smallest, which shows the most of it (the CSS
// clamps the lines with an ellipsis) and is the likeliest to keep its
// longest word whole.
export function titleSize(title: string, width = 0.7, maxLines = 6, sans = false): TitleSize {
  const words = title.trim().split(/\s+/).filter(Boolean).map((w) => wordEm(w) * (sans ? SANS_FACTOR : 1));
  if (words.length === 0) return "m";
  for (const { size, em, lines } of SIZES) {
    const perLine = (width * 100) / em; // line length in em
    if (Math.max(...words) > perLine) continue;
    let used = 1;
    let line = 0;
    for (const w of words) {
      const next = line === 0 ? w : line + SPACE_EM + w;
      if (next <= perLine) line = next;
      else {
        used++;
        line = w;
      }
    }
    if (used <= Math.min(lines, maxLines)) return size;
  }
  return "xl";
}

// ---- the design of one cover

export type CoverDesign = {
  family: CoverFamily;
  layout: CoverLayout;
  titleSize: TitleSize;
  plate: boolean;
  paper: boolean;
  // 0..2: the variation of the family's ornament.
  variant: number;
  seed: number;
  // CSS custom properties: cloth (dark, light), lettering, ornament, accent,
  // and for children's books the tilt of the title card.
  vars: Record<string, string>;
};

export function coverDesign({
  seed,
  category,
  colorKey,
  title,
}: {
  seed: string;
  category?: string | null;
  colorKey?: string | null;
  title: string;
}): CoverDesign {
  const family: CoverFamily = (category && FAMILY_BY_CATEGORY[category]) || "classic";
  const f = FAMILIES[family];
  const h = hashSeed(`${family}:${seed}`);
  const rand = seededRandom(h);
  const variant = Math.floor(rand() * 3);
  const pick = Math.floor(rand() * f.layouts.length);
  const layout = f.byVariant ? f.layouts[variant % f.layouts.length] : f.layouts[pick];
  const tone = Math.floor(rand() * 3);
  const goldOrnament = rand() < 0.6;
  const tilt = (rand() - 0.5) * 5;
  const colors = PALETTE[colorKey ?? ""] ?? PALETTE.cloth;

  let bg: string;
  let light: string;
  let text: string;
  let orn: string;
  if (f.paper) {
    // Paper, lettered in ink; the category's own colour only in the rules.
    bg = tone === 2 ? shade(PAPER.bg, 0.97) : PAPER.bg;
    light = PAPER.light;
    text = PAPER.text;
    orn = colors.bg === PAPER.text ? PAPER.text : colors.bg;
  } else {
    // Three tones of the same cloth, so a shelf of one category isn't a wall
    // of identical colour.
    bg = tone === 0 ? colors.bg : tone === 1 ? shade(colors.bg, 0.86) : colors.light;
    light = tone === 2 ? shade(colors.light, 1.12) : colors.light;
    text = colors.text;
    orn = goldOrnament ? colors.accent : colors.text;
  }
  return {
    family,
    layout,
    titleSize: titleSize(title, f.width, f.lines, f.sans),
    plate: Boolean(f.plate),
    paper: Boolean(f.paper),
    variant,
    seed: h,
    vars: {
      "--cv-bg": bg,
      "--cv-light": light,
      "--cv-text": text,
      "--cv-orn": orn,
      "--cv-acc": colors.accent,
      ...(family === "children" ? { "--cv-tilt": `${tilt.toFixed(1)}deg` } : {}),
    },
  };
}
