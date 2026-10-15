// Collects evidence for the death year of authors Wikidata has none for, so
// a person can decide each one (scripts/wikisource/death-years.ts). Nothing
// here decides anything: it gathers what each source says.
//
//   npx tsx scripts/wikisource/death-evidence.ts
//
// Sources, per author:
//   - Wikidata, asked live (the year may have been added since);
//   - the Bangla and English Wikipedia articles linked from the item: the
//     infobox death field (and whether a <ref> backs it), the lead's
//     life-span, and "XXXX deaths" / "XXXX-এ মৃত্যু" categories;
//   - Banglapedia (bn and en): full-text search for the name, and the
//     sentences of the best hit that mention a year.
import { readFileSync, writeFileSync } from "node:fs";
import { askLiveOnly, mwQueryAll, postForm, WIKIDATA_API } from "./http";
import { toLatinDigits } from "./verify";

askLiveOnly();

type Author = { id: string; nameBn: string | null; nameEn: string | null; works: string[] };
const authors = JSON.parse(readFileSync("data/.wikisource-cache/no-death-year-authors.json", "utf8")) as Author[];

type Entity = { sitelinks?: Record<string, { title: string }>; claims?: Record<string, { mainsnak: { datavalue?: { value: unknown } } }[]>; descriptions?: Record<string, { value: string }> };

const YEAR = /1[0-9]{3}/; // not global: .test() on a global regex keeps state
const timeYears = (e: Entity | undefined, p: string) =>
  (e?.claims?.[p] ?? []).map((c) => (c.mainsnak.datavalue?.value as { time?: string; precision?: number } | undefined)).filter(Boolean).map((v) => `${v!.time?.slice(1, 5)} (precision ${v!.precision})`);

async function wikiEvidence(api: string, title: string) {
  const [page] = await mwQueryAll(api, { titles: title, prop: "revisions|categories", rvprop: "content", rvslots: "main", cllimit: "max", redirects: "1" });
  if (!page || page.missing) return null;
  const text = String((page.revisions as { slots: { main: { content: string } } }[] | undefined)?.[0]?.slots.main.content ?? "");
  const fields = [...text.matchAll(/\|\s*(death_date|death_year|died|মৃত্যু[^=|\n]*)\s*=([^\n]*)/gi)].map((m) => {
    const value = m[2].trim();
    return { field: m[1].trim(), value: value.slice(0, 160), cited: /<ref/i.test(value) };
  });
  const lead = text.replace(/\{\{[^{}]*\}\}/g, "").split("\n").find((l) => l.trim() && !l.startsWith("[[") && !l.startsWith("|") && !l.startsWith("{") && !l.startsWith("}"))?.slice(0, 300) ?? "";
  const categories = ((page.categories as { title: string }[] | undefined) ?? []).map((c) => c.title).filter((c) => /deaths|মৃত্যু/.test(c));
  return { url: `${api.replace("/w/api.php", "/wiki/")}${encodeURIComponent(String(page.title).replace(/ /g, "_"))}`, fields, lead: toLatinDigits(lead), categories: categories.map(toLatinDigits) };
}

async function banglapedia(lang: "bn" | "en", name: string) {
  const api = `https://${lang}.banglapedia.org/api.php`;
  const search = await postForm<{ query?: { search?: { title: string; snippet: string }[] } }>(api, {
    action: "query", format: "json", formatversion: "2", list: "search", srsearch: `"${name}"`, srlimit: "3",
  });
  const hits = search.query?.search ?? [];
  if (!hits.length) return { hits: [] as string[] };
  const top = hits.find((h) => h.title.replace(/[,،].*$/, "").trim() === name) ?? hits[0];
  const [page] = await mwQueryAll(api, { titles: top.title, prop: "revisions", rvprop: "content", rvslots: "main" });
  const text = toLatinDigits(String((page?.revisions as { slots: { main: { content: string } } }[] | undefined)?.[0]?.slots.main.content ?? ""));
  const sentences = text.split(/(?<=[।.])\s+/).filter((s) => YEAR.test(s) && /মৃত্যু|মারা|প্রয়াত|died|death|\(\s*1[0-9]{3}\s*[-–]/.test(s)).slice(0, 4).map((s) => s.slice(0, 300));
  return { hits: hits.map((h) => h.title), page: top.title, url: `https://${lang}.banglapedia.org/index.php/${encodeURIComponent(top.title.replace(/ /g, "_"))}`, sentences };
}

async function main() {
  const out = [];
  const entities = new Map<string, Entity>();
  for (let i = 0; i < authors.length; i += 50) {
    const json = await postForm<{ entities: Record<string, Entity> }>(WIKIDATA_API, {
      action: "wbgetentities", format: "json", ids: authors.slice(i, i + 50).map((a) => a.id).join("|"),
      props: "sitelinks|claims|descriptions", sitefilter: "bnwiki|enwiki", languages: "bn|en",
    });
    for (const [id, e] of Object.entries(json.entities)) entities.set(id, e);
  }
  for (const [n, a] of authors.entries()) {
    const e = entities.get(a.id);
    const ev: Record<string, unknown> = {
      id: a.id, nameBn: a.nameBn, nameEn: a.nameEn, works: a.works,
      wikidata: { death: timeYears(e, "P570"), birth: timeYears(e, "P569"), floruit: timeYears(e, "P1317"), workEnd: timeYears(e, "P2032"), description: e?.descriptions?.bn?.value ?? e?.descriptions?.en?.value ?? null },
    };
    const bnwiki = e?.sitelinks?.bnwiki?.title;
    const enwiki = e?.sitelinks?.enwiki?.title;
    if (bnwiki) ev.bnwiki = await wikiEvidence("https://bn.wikipedia.org/w/api.php", bnwiki);
    if (enwiki) ev.enwiki = await wikiEvidence("https://en.wikipedia.org/w/api.php", enwiki);
    if (a.nameBn) ev.banglapediaBn = await banglapedia("bn", a.nameBn);
    if (a.nameEn) ev.banglapediaEn = await banglapedia("en", a.nameEn);
    out.push(ev);
    console.log(`${n + 1}/${authors.length} ${a.nameBn ?? a.nameEn}: wiki ${bnwiki ? "bn" : "-"}/${enwiki ? "en" : "-"}`);
  }
  writeFileSync("data/.wikisource-cache/death-evidence.json", JSON.stringify(out, null, 1));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
