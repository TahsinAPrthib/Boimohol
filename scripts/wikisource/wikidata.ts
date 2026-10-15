// Stage 2: Wikidata. Each scan's index links to its edition item; from there
// come the work it is an edition of, the authors, translators and editors,
// and their death dates.
import { postForm, WIKIDATA_API } from "./http";

type Snak = { snaktype: string; datavalue?: { value: unknown } };
type Claim = { mainsnak: Snak; rank: string; qualifiers?: Record<string, unknown[]> };
export type Entity = {
  id: string;
  labels?: Record<string, { value: string }>;
  claims?: Record<string, Claim[]>;
  sitelinks?: Record<string, { title: string }>;
  missing?: string;
};

export const Q = {
  human: "Q5",
  anonymous: "Q4233718",
  bengali: "Q9610",
  edition: "Q3331189",
};

export async function getEntities(ids: string[]): Promise<Map<string, Entity>> {
  const out = new Map<string, Entity>();
  const unique = [...new Set(ids)].filter((id) => /^Q\d+$/.test(id)).sort();
  for (let i = 0; i < unique.length; i += 50) {
    const json = await postForm<{ entities?: Record<string, Entity> }>(WIKIDATA_API, {
      action: "wbgetentities",
      format: "json",
      ids: unique.slice(i, i + 50).join("|"),
      props: "labels|claims|sitelinks",
      languages: "bn|en",
      sitefilter: "bnwikisource",
    });
    for (const [id, e] of Object.entries(json.entities ?? {})) if (!e.missing) out.set(id, e);
  }
  return out;
}

const live = (e: Entity | undefined, p: string) => (e?.claims?.[p] ?? []).filter((c) => c.rank !== "deprecated");

// Item ids of a property; "somevalue" (an unknown person) comes back as "?".
export function itemIds(e: Entity | undefined, p: string): string[] {
  return live(e, p).map((c) =>
    c.mainsnak.snaktype === "somevalue" ? "?" : ((c.mainsnak.datavalue?.value as { id?: string } | undefined)?.id ?? "")
  ).filter(Boolean);
}

export function strings(e: Entity | undefined, p: string): string[] {
  return live(e, p)
    .map((c) => c.mainsnak.datavalue?.value)
    .map((v) => (typeof v === "string" ? v : (v as { text?: string } | undefined)?.text ?? ""))
    .filter(Boolean);
}

// When someone died, from Wikidata's best-ranked P570 claims (preferred if
// any, else normal): the latest year the date could mean -- a decade counts
// as its last year, a century as its last year -- so the public-domain check
// errs strict; and how to say it in a rights note, without claiming more
// precision than Wikidata has ("আনুমানিক ১২৪৫ সালে", "খ্রিস্টপূর্ব ২৯০-এর
// দশকে", "৭ম শতকে"). null when there's no date, or it's coarser than a century.
export type Death = { year: number; text: string };

const BN = "০১২৩৪৫৬৭৮৯";
const bnNum = (n: number) => String(n).replace(/\d/g, (d) => BN[Number(d)]);
const bnYear = (y: number) => (y < 0 ? `খ্রিস্টপূর্ব ${bnNum(-y)}` : bnNum(y));
// Bangla ordinals as used for centuries: ১ম ২য় ৩য় ৪র্থ ৫ম ৬ষ্ঠ ... ১০ম, ১১শ ... ২০শ.
const bnOrdinal = (n: number) =>
  bnNum(n) + (n === 1 || n === 5 || (n >= 7 && n <= 10) ? "ম" : n === 2 || n === 3 ? "য়" : n === 4 ? "র্থ" : n === 6 ? "ষ্ঠ" : "শ");

export function deathOf(e: Entity | undefined): Death | null {
  const claims = live(e, "P570");
  const preferred = claims.filter((c) => c.rank === "preferred");
  let best: Death | null = null;
  for (const c of preferred.length ? preferred : claims) {
    const v = c.mainsnak.datavalue?.value as { time?: string; precision?: number } | undefined;
    const m = v?.time?.match(/^([+-]\d+)-/);
    if (!m) continue;
    const y = Number(m[1]);
    const precision = v!.precision ?? 0;
    // P1480 "sourcing circumstances" = Q5727902 "circa". (P1480 has other
    // values -- Tagore's exact 1941 carries one -- that aren't approximations.)
    const circa = (c.qualifiers?.P1480 ?? []).some((q) => (q as { datavalue?: { value?: { id?: string } } }).datavalue?.value?.id === "Q5727902");
    let d: Death;
    if (precision >= 9) d = { year: y, text: `${circa ? "আনুমানিক " : ""}${bnYear(y)} সালে` };
    else if (precision === 8) d = { year: y < 0 ? y : y + 9, text: `${bnYear(y)}-এর দশকে` };
    else if (precision === 7) {
      const century = y > 0 ? Math.ceil(y / 100) : Math.ceil(-y / 100);
      d = { year: y > 0 ? century * 100 : -(century - 1) * 100 - 1, text: `${y < 0 ? "খ্রিস্টপূর্ব " : ""}${bnOrdinal(century)} শতকে` };
    } else continue;
    if (!best || d.year > best.year) best = d;
  }
  return best;
}

export function earliestYear(e: Entity | undefined, p: string): number | null {
  const ys = live(e, p)
    .map((c) => (c.mainsnak.datavalue?.value as { time?: string; precision?: number } | undefined))
    .filter((v) => v?.time && (v.precision ?? 0) >= 9)
    .map((v) => Number(v!.time!.match(/^([+-]\d+)-/)?.[1]));
  return ys.length ? Math.min(...ys) : null;
}

export const label = (e: Entity | undefined, lang: "bn" | "en") => e?.labels?.[lang]?.value ?? null;
