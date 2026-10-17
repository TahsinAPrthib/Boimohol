import "server-only";
import { WIKISOURCE_ORIGIN } from "./titles";

// The Wikisource (MediaWiki) API, following Wikimedia's API etiquette
// (https://www.mediawiki.org/wiki/API:Etiquette, and the User-Agent policy):
// - a User-Agent naming the site and a contact address;
// - GET requests (cacheable on Wikimedia's side), JSON, compressed (fetch
//   asks for gzip by default);
// - maxlag=5, so a busy replica tells us to back off instead of us adding
//   to its load; and no retry loop on an error -- the reader shows a cached
//   copy or a link to Wikisource instead;
// - one request at a time: callers await each before the next;
// - everything fetched is kept about a week (reader.ts), so a page is
//   fetched at most once a week however often it is read.
export const USER_AGENT = "BoiMohol/1.0 (https://boimohol-delta.vercel.app; tahsinaparthib1@gmail.com) in-site reader";
const API = `${WIKISOURCE_ORIGIN}/w/api.php`;
const TIMEOUT_MS = 10_000;

// For checking the reader against a stand-in server in development only
// (malicious pages, an unreachable Wikisource). Never read in production.
function apiUrl(): string {
  const override = process.env.WIKISOURCE_API_URL;
  return override && process.env.NODE_ENV !== "production" ? override : API;
}

// Wikisource couldn't be reached or refused the request: show a cached copy
// if there is one, otherwise a link to the page on Wikisource.
export class WikisourceUnavailable extends Error {}
// The page doesn't exist (any more).
export class WikisourceMissing extends Error {}

async function get<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(apiUrl());
  for (const [k, v] of Object.entries({ format: "json", formatversion: "2", maxlag: "5", ...params })) url.searchParams.set(k, v);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    throw new WikisourceUnavailable(`request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) throw new WikisourceUnavailable(`HTTP ${res.status}`);
  let json: T & { error?: { code?: string } };
  try {
    json = (await res.json()) as T & { error?: { code?: string } };
  } catch {
    throw new WikisourceUnavailable("not JSON");
  }
  if (json.error) {
    if (json.error.code === "missingtitle" || json.error.code === "invalidtitle") throw new WikisourceMissing(json.error.code);
    throw new WikisourceUnavailable(`API error ${json.error.code ?? "?"}`);
  }
  return json;
}

// A page as HTML, following redirects. `title` is where it ended up.
export async function fetchPage(title: string): Promise<{ title: string; html: string }> {
  const json = await get<{ parse?: { title?: string; text?: string } }>({
    action: "parse",
    page: title,
    prop: "text",
    redirects: "1",
    disableeditsection: "1",
    disabletoc: "1",
    disablelimitreport: "1",
  });
  if (typeof json.parse?.text !== "string" || typeof json.parse.title !== "string") throw new WikisourceUnavailable("unexpected parse response");
  return { title: json.parse.title, html: json.parse.text };
}

// Every page below `title` (all depths), excluding redirects, in title
// order. Stops at `limit`.
export async function fetchSubpages(title: string, limit = 1500): Promise<string[]> {
  const out: string[] = [];
  let cont: Record<string, string> = {};
  for (let round = 0; round < 4 && out.length < limit; round++) {
    const json = await get<{ query?: { allpages?: { title: string }[] }; continue?: Record<string, string> }>({
      action: "query",
      list: "allpages",
      apprefix: `${title}/`,
      apnamespace: "0",
      apfilterredir: "nonredirects",
      aplimit: "500",
      ...cont,
    });
    out.push(...(json.query?.allpages ?? []).map((p) => p.title));
    if (!json.continue) break;
    cont = json.continue;
  }
  return out.slice(0, limit);
}

export type ScanFile = { name: string; url: string; bytes: number };

// Scans on Wikimedia Commons that are PDFs, with their size. DjVu scans
// (which browsers can't open) and files kept only on Wikisource are left out.
export async function fetchScanInfo(names: string[]): Promise<{ name: string; file: ScanFile | null }[]> {
  if (names.length === 0) return [];
  const json = await get<{
    query?: {
      normalized?: { from: string; to: string }[];
      pages?: { title: string; imagerepository?: string; imageinfo?: { url: string; size: number; mime: string }[] }[];
    };
  }>({
    action: "query",
    titles: names.slice(0, 50).map((n) => `File:${n}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|size|mime",
  });
  const toTitle = new Map((json.query?.normalized ?? []).map((n) => [n.from, n.to]));
  const pages = new Map((json.query?.pages ?? []).map((p) => [p.title, p]));
  return names.slice(0, 50).map((name) => {
    const page = pages.get(toTitle.get(`File:${name}`) ?? `File:${name}`);
    const info = page?.imageinfo?.[0];
    // A Commons file has no page of its own on Wikisource, so it comes back
    // "missing" (and "known"): what counts is that its repository is Commons
    // ("shared") and it has file info.
    const ok =
      page &&
      page.imagerepository === "shared" &&
      info?.mime === "application/pdf" &&
      typeof info.size === "number" &&
      /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(info.url);
    if (!ok) return { name, file: null };
    // Without the tracking parameters Wikimedia adds (?utm_source=...).
    const url = new URL(info.url);
    url.search = "";
    return { name, file: { name, url: url.toString(), bytes: info.size } };
  });
}
