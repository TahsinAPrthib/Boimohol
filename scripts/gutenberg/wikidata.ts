// Wikidata for the Gutenberg selection: authors and translators through the
// Wikipedia pages Gutenberg links them to; works through Wikidata's own
// "Project Gutenberg ebook ID" (P2034) or the book's Wikipedia page. All
// cached on disk by the shared http layer.
import { postForm, WIKIDATA_API, WIKIDATA_SPARQL } from "../wikisource/http";
import { deathOf, itemIds, label, type Death, type Entity } from "../wikisource/wikidata";

// nameBn: the Bangla Wikipedia article's title when there is one (the name
// readers know: "মার্ক টোয়েন"), else Wikidata's Bangla label (which is
// sometimes the legal name: "স্যামুয়েল ল্যাঙ্গহোর্ণ ক্লিমেন্স").
// languages: every language Wikidata gives (spoken, native, written in);
// native and writing keep the native language (P103) and the languages of
// their writing (P6886) apart, for telling a translation.
export type PersonFacts = { id: string; death: Death | null; languages: string[]; native: string[]; writing: string[]; nameBn: string | null; nameEn: string | null };
const bnName = (e: Fetched) => e.sitelinks?.bnwiki?.title?.replace(/\s*\([^)]*\)\s*$/, "").trim() || label(e, "bn");
export type WorkFacts = { id: string; bnwiki: string | null; languages: string[]; nameBn: string | null; nameEn: string | null };

type Fetched = Entity & { sitelinks?: Record<string, { site: string; title: string }> };

// Wikipedia titles as given -> the article they lead to (normalised, and
// through redirects: Gutenberg often links an old title such as
// "Fyodor_Dostoyevsky", which Wikidata only knows by the current one).
async function canonicalTitles(site: string, titles: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const host = `${site.replace(/wiki$/, "").replace(/_/g, "-")}.wikipedia.org`;
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const json = await postForm<{ query?: { normalized?: { from: string; to: string }[]; redirects?: { from: string; to: string }[] } }>(
      `https://${host}/w/api.php`,
      { action: "query", format: "json", formatversion: "2", titles: batch.join("|"), redirects: "1" }
    );
    const norm = new Map((json.query?.normalized ?? []).map((n) => [n.from, n.to]));
    const redir = new Map((json.query?.redirects ?? []).map((r) => [r.from, r.to]));
    for (const t of batch) {
      const n = norm.get(t) ?? t;
      out.set(t, redir.get(n) ?? n);
    }
  }
  return out;
}

async function entitiesByTitles(site: string, titles: string[]): Promise<Map<string, Fetched>> {
  const out = new Map<string, Fetched>();
  const given = [...new Set(titles)].filter(Boolean);
  const canonical = await canonicalTitles(site, given);
  const unique = [...new Set(canonical.values())];
  const found = new Map<string, Fetched>();
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const json = await postForm<{ entities?: Record<string, Fetched & { missing?: string }> }>(WIKIDATA_API, {
      action: "wbgetentities",
      format: "json",
      sites: site,
      titles: batch.join("|"),
      props: "claims|labels|sitelinks",
      languages: "bn|en",
      sitefilter: `${site}|bnwiki`,
    });
    for (const e of Object.values(json.entities ?? {})) {
      const t = e.sitelinks?.[site]?.title;
      if (!e.missing && t) found.set(t, e);
    }
  }
  for (const t of given) {
    const e = found.get(canonical.get(t) ?? t);
    if (e) out.set(`${site}:${t}`, e);
  }
  return out;
}

async function entitiesByIds(ids: string[]): Promise<Map<string, Fetched>> {
  const out = new Map<string, Fetched>();
  const unique = [...new Set(ids)].filter((id) => /^Q\d+$/.test(id));
  for (let i = 0; i < unique.length; i += 50) {
    const json = await postForm<{ entities?: Record<string, Fetched & { missing?: string }> }>(WIKIDATA_API, {
      action: "wbgetentities",
      format: "json",
      ids: unique.slice(i, i + 50).join("|"),
      props: "claims|labels|sitelinks",
      languages: "bn|en",
      sitefilter: "bnwiki|enwiki",
    });
    for (const [id, e] of Object.entries(json.entities ?? {})) if (!e.missing) out.set(id, e);
  }
  return out;
}

// "https://en.wikipedia.org/wiki/Jane_Austen" -> ["enwiki", "Jane Austen"]
export function wikiKey(url: string): [string, string] | null {
  const m = url.match(/^https?:\/\/([a-z-]+)\.wikipedia\.org\/wiki\/(.+)$/);
  if (!m) return null;
  let title = m[2];
  try {
    title = decodeURIComponent(title);
  } catch {
    /* keep as is */
  }
  return [`${m[1].replace(/-/g, "_")}wiki`, title.replace(/_/g, " ").split("#")[0]];
}

const languagesOf = (e: Entity | undefined) => [...new Set([...itemIds(e, "P1412"), ...itemIds(e, "P103"), ...itemIds(e, "P6886")])];

// People, keyed by the Wikipedia URL Gutenberg gave for them.
export async function peopleByWikipedia(urls: string[]): Promise<Map<string, PersonFacts>> {
  const bySite = new Map<string, string[]>();
  for (const u of urls) {
    const k = wikiKey(u);
    if (k) bySite.set(k[0], [...(bySite.get(k[0]) ?? []), k[1]]);
  }
  const out = new Map<string, PersonFacts>();
  for (const [site, titles] of bySite) {
    const found = await entitiesByTitles(site, titles);
    for (const u of urls) {
      const k = wikiKey(u);
      if (!k || k[0] !== site) continue;
      const e = found.get(`${site}:${k[1]}`);
      if (e) out.set(u, { id: e.id, death: deathOf(e), languages: languagesOf(e), native: itemIds(e, "P103"), writing: itemIds(e, "P6886"), nameBn: bnName(e), nameEn: label(e, "en") });
    }
  }
  return out;
}

// Works for Gutenberg ebook ids: through P2034 (on the work, or on an
// edition whose P629 names the work), else the book's own Wikipedia page.
export async function worksFor(books: { id: number; wikipedia: string | null }[]): Promise<Map<number, WorkFacts>> {
  const itemFor = new Map<number, string>();
  for (let i = 0; i < books.length; i += 200) {
    const values = books.slice(i, i + 200).map((b) => `"${b.id}"`).join(" ");
    const json = await postForm<{ results?: { bindings?: { gid: { value: string }; item: { value: string }; work?: { value: string } }[] } }>(WIKIDATA_SPARQL, {
      query: `SELECT ?gid ?item ?work WHERE { VALUES ?gid { ${values} } ?item wdt:P2034 ?gid . OPTIONAL { ?item wdt:P629 ?work } }`,
      format: "json",
    });
    for (const b of json.results?.bindings ?? []) {
      const id = (b.work ?? b.item).value.replace("http://www.wikidata.org/entity/", "");
      if (!itemFor.has(Number(b.gid.value))) itemFor.set(Number(b.gid.value), id);
    }
  }
  const byPage = await entitiesByTitles("enwiki", books.filter((b) => !itemFor.has(b.id) && b.wikipedia).map((b) => wikiKey(b.wikipedia!)?.[1] ?? ""));
  const entities = await entitiesByIds([...itemFor.values()]);
  const out = new Map<number, WorkFacts>();
  for (const b of books) {
    const viaId = itemFor.get(b.id);
    const e = viaId ? entities.get(viaId) : b.wikipedia ? byPage.get(`enwiki:${wikiKey(b.wikipedia)?.[1]}`) : undefined;
    if (e) out.set(b.id, { id: e.id, bnwiki: e.sitelinks?.bnwiki?.title ?? null, languages: itemIds(e, "P407"), nameBn: label(e, "bn"), nameEn: label(e, "en") });
  }
  return out;
}
