// Stores the Gutenberg books of the seed list (src/lib/gutenberg/lists.json,
// the 1,000 most downloaded the reader can show) in the texts database,
// pinned, before anyone opens them. Run by .github/workflows/gutenberg-seed.yml,
// which first copies their HTML by rsync from Project Gutenberg's mirror
// (gutenberg.pglaf.org::gutenberg-epub); a book rsync didn't bring is
// fetched over HTTPS from the same mirror, one at a time, a few seconds
// apart. Books already stored under the current rules are skipped, so a run
// that stops can simply be started again.
//
//   TEXTS_DATABASE_URL=<texts database> npx tsx scripts/gutenberg-seed.ts [--dir <rsync folder>] [--limit 1000]
import { existsSync, readFileSync } from "node:fs";
import lists from "../src/lib/gutenberg/lists.json";
import { fetchBookHtml } from "../src/lib/gutenberg/mirror";
import { parseGutenbergHtml, PARSER_VERSION } from "../src/lib/gutenberg/parse";
import { closeTexts, readBook, saveBook } from "../src/lib/gutenberg/store";

const HTTP_GAP_MS = 3000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? (process.argv[i + 1] ?? null) : null;
}

async function main() {
  if (!process.env.TEXTS_DATABASE_URL) throw new Error("TEXTS_DATABASE_URL is not set");
  const dir = arg("dir");
  const limit = Number(arg("limit") ?? lists.seed.length);
  if (!Number.isInteger(limit) || limit < 1 || limit > lists.seed.length) throw new Error(`--limit must be 1..${lists.seed.length}`);
  const ids = lists.seed.slice(0, limit);
  let stored = 0;
  let skipped = 0;
  let overHttp = 0;
  let bytes = 0;
  const failed: number[] = [];
  const started = Date.now();
  for (const [i, id] of ids.entries()) {
    const have = await readBook(id);
    if (have?.status === "ready" && have.version === PARSER_VERSION && have.pinned) {
      skipped++;
      continue;
    }
    try {
      const file = dir ? `${dir}/${id}/pg${id}-images.html` : null;
      let html: string;
      if (file && existsSync(file)) html = readFileSync(file, "utf8");
      else {
        html = await fetchBookHtml(id);
        overHttp++;
        await sleep(HTTP_GAP_MS);
      }
      bytes += await saveBook(id, parseGutenbergHtml(html), { version: PARSER_VERSION, pinned: true });
      stored++;
    } catch (err) {
      failed.push(id);
      console.error(`#${id}: ${err instanceof Error ? err.message : err}`);
    }
    if ((i + 1) % 50 === 0) console.log(`${i + 1}/${ids.length}: stored ${stored}, already there ${skipped}, failed ${failed.length}`);
  }
  console.log(
    `done in ${Math.round((Date.now() - started) / 1000)} s: stored ${stored} (${(bytes / 1e6).toFixed(1)} MB compressed; ${overHttp} over HTTPS), already there ${skipped}, failed ${failed.length}${failed.length ? `: ${failed.join(", ")}` : ""}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closeTexts);
