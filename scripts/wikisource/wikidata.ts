// Stage 2: Wikidata. Each scan's index links to its edition item; from there
// come the work it is an edition of, the authors, translators and editors,
// and their death dates.
import { postForm, WIKIDATA_API } from "./http";

type Snak = { snaktype: string; datavalue?: { value: unknown } };
type Claim = { mainsnak: Snak; rank: string };
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

// The latest year a time value could mean, given its precision: a death
// known only to the decade counts as the decade's last year, so the
// public-domain check errs on the strict side. null when coarser than a
// century or absent.
export function latestYears(e: Entity | undefined, p: string): number[] {
  return live(e, p)
    .map((c) => c.mainsnak.datavalue?.value as { time?: string; precision?: number } | undefined)
    .map((v) => {
      if (!v?.time) return null;
      const m = v.time.match(/^([+-]\d+)-/);
      if (!m) return null;
      const y = Number(m[1]);
      const precision = v.precision ?? 0;
      if (precision >= 9) return y;
      if (precision === 8) return y + 9;
      if (precision === 7) return y + 99;
      return null;
    })
    .filter((y): y is number => y !== null);
}

export function earliestYear(e: Entity | undefined, p: string): number | null {
  const ys = live(e, p)
    .map((c) => (c.mainsnak.datavalue?.value as { time?: string; precision?: number } | undefined))
    .filter((v) => v?.time && (v.precision ?? 0) >= 9)
    .map((v) => Number(v!.time!.match(/^([+-]\d+)-/)?.[1]));
  return ys.length ? Math.min(...ys) : null;
}

export const label = (e: Entity | undefined, lang: "bn" | "en") => e?.labels?.[lang]?.value ?? null;
