// Re-checks a sample of the Gutenberg import live: each book's Gutenberg page
// is reachable and is that book, and every author's and translator's death
// year is asked of Wikidata again (not from the cache). 20 page requests,
// two seconds apart.
//
//   npx tsx scripts/gutenberg-spot-check.ts      (after gutenberg-import.ts)
//
// Writes data/gutenberg-spot-check.md.
import { readFileSync, writeFileSync } from "node:fs";
import { askLiveOnly, networkCalls, USER_AGENT } from "./wikisource/http";
import { peopleByWikipedia } from "./gutenberg/wikidata";

askLiveOnly();
const PD_CUTOFF = new Date().getUTCFullYear() - 61;
type P = { name: string; wikipedia: string[]; year: number };
type Sample = { id: number; title: string; authors: P[]; translators: P[] };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const sample = JSON.parse(readFileSync("data/.gutenberg-cache/spot-check-sample.json", "utf8")) as Sample[];
  const people = sample.flatMap((s) => [...s.authors, ...s.translators]);
  const facts = await peopleByWikipedia([...new Set(people.flatMap((p) => p.wikipedia.filter((u) => /\/\/en\.wikipedia\.org\//.test(u))))]);

  const rows: string[] = [];
  const notes: string[] = [];
  let passed = 0;
  for (const [i, s] of sample.entries()) {
    const problems: string[] = [];
    const url = `https://www.gutenberg.org/ebooks/${s.id}`;
    let pageNote = "";
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      const html = await res.text();
      const pageTitle = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "";
      const firstWord = s.title.split(/\s+/).find((w) => w.length > 3) ?? s.title;
      pageNote = `${res.status}, “${pageTitle.slice(0, 60)}”`;
      if (!res.ok) problems.push(`page answered ${res.status}`);
      // Both sides as letters and digits only ("Hero-Myths" is "heromyths").
      else if (!pageTitle.toLowerCase().replace(/[^a-z0-9]/g, "").includes(firstWord.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5))) problems.push(`page title doesn't look like “${s.title}”`);
    } catch (e) {
      problems.push(`page not reachable (${(e as Error).message})`);
    }
    await sleep(2000);

    const died = [...s.authors.map((p) => ({ p, role: "author" })), ...s.translators.map((p) => ({ p, role: "translator" }))].map(({ p, role }) => {
      const f = p.wikipedia.map((u) => facts.get(u)).find(Boolean);
      const live = f?.death?.year ?? null;
      if (p.year > PD_CUTOFF) problems.push(`${p.name} died after ${PD_CUTOFF}`);
      if (live !== null && live > p.year) problems.push(`${p.name}: Wikidata now says ${live}, the import used ${p.year}`);
      return `${role} ${p.name}: ${p.year}${live === null ? " (not on Wikidata; catalog year)" : live === p.year ? " ✓ Wikidata" : ` (Wikidata ${live})`}`;
    });

    const ok = problems.length === 0;
    if (ok) passed++;
    else notes.push(`- **${s.title}**: ${problems.join("; ")}`);
    rows.push(`| ${i + 1} | [${s.title.replace(/\|/g, "\\|")}](${url}) | ${died.join("<br>")} | ${pageNote} | ${ok ? "✓ pass" : "✗ see below"} |`);
    console.log(`  ${i + 1}/${sample.length} ${ok ? "pass" : "FAIL"} ${s.title}`);
  }

  writeFileSync(
    "data/gutenberg-spot-check.md",
    [
      "# Spot-check, Gutenberg import",
      "",
      `Checked ${new Date().toISOString().slice(0, 10)} by \`scripts/gutenberg-spot-check.ts\`, live (${networkCalls} Wikidata requests, ${sample.length} Gutenberg page requests). A sample of ${sample.length} new books.`,
      "",
      `**${passed} of ${sample.length} passed.** Each book's page answered and is that book, and every author and translator died in ${PD_CUTOFF} or earlier, with Wikidata (asked again) agreeing where it has the person.`,
      "",
      "| # | Book | Died | Gutenberg page | Result |",
      "|---|---|---|---|---|",
      ...rows,
      "",
      ...(notes.length ? ["Problems found:", "", ...notes] : ["No problems found."]),
      "",
    ].join("\n")
  );
  console.log(`\n${passed}/${sample.length} passed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
