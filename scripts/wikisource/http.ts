// A polite, cached HTTP layer for the Wikimedia APIs: an identifying
// User-Agent (Wikimedia's policy), a minimum gap between requests to each
// host, retries with back-off on 429/5xx, and every response cached on disk
// so a rerun costs nothing.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const USER_AGENT = "BoiMoholCatalogBot/0.1 (https://boimohol-delta.vercel.app; tahsinaparthib1@gmail.com)";
const CACHE_DIR = join(process.cwd(), "data", ".wikisource-cache");
const GAP_MS: Record<string, number> = { "bn.wikisource.org": 1100, "www.wikidata.org": 600, "query.wikidata.org": 1500 };
const lastCall = new Map<string, number>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export let networkCalls = 0;
// The spot-check re-asks everything live: no cached answer is read, and the
// fresh ones aren't written back, so the import's own basis stays as it was.
let live = false;
export function askLiveOnly() {
  live = true;
}

function cachePath(key: string) {
  mkdirSync(CACHE_DIR, { recursive: true });
  return join(CACHE_DIR, createHash("sha1").update(key).digest("hex") + ".json");
}

export async function postForm<T = unknown>(url: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(params).toString();
  const file = cachePath(`${url}\n${body}`);
  if (!live && existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as T;

  const host = new URL(url).host;
  for (let attempt = 1; ; attempt++) {
    const wait = (lastCall.get(host) ?? 0) + (GAP_MS[host] ?? 1000) - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall.set(host, Date.now());
    networkCalls++;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 120_000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: url.includes("sparql") ? "application/sparql-results+json" : "application/json",
        },
        body,
        signal: ctrl.signal,
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const json = (await res.json()) as T & { error?: { info?: string } };
      if (json && typeof json === "object" && "error" in json && json.error) throw new Error(`API error: ${json.error.info}`);
      if (!live) writeFileSync(file, JSON.stringify(json));
      return json;
    } catch (err) {
      if (attempt >= 5) throw err;
      await sleep(2000 * attempt * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
}

// MediaWiki action API with formatversion=2, following `continue` until done
// and merging the pages it returns (props from later batches added to the
// same page objects).
export async function mwQueryAll(api: string, params: Record<string, string>): Promise<Record<string, unknown>[]> {
  const pages = new Map<number | string, Record<string, unknown>>();
  let cont: Record<string, string> = {};
  for (;;) {
    const json = await postForm<{ query?: { pages?: Record<string, unknown>[] }; continue?: Record<string, string> }>(api, {
      format: "json",
      formatversion: "2",
      action: "query",
      ...params,
      ...cont,
    });
    for (const p of json.query?.pages ?? []) {
      const key = (p.pageid as number | undefined) ?? (p.title as string);
      const prev = pages.get(key);
      if (!prev) pages.set(key, p);
      else
        for (const [k, v] of Object.entries(p)) {
          if (Array.isArray(v) && Array.isArray(prev[k])) prev[k] = [...(prev[k] as unknown[]), ...v];
          else if (!(k in prev)) prev[k] = v;
        }
    }
    if (!json.continue) break;
    cont = json.continue;
  }
  return [...pages.values()];
}

export const WIKISOURCE_API = "https://bn.wikisource.org/w/api.php";
export const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
export const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";
