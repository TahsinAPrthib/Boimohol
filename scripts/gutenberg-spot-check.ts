// Re-checks a sample of the Gutenberg import live: each book's Gutenberg page
// is reachable and is that book, and every author's and translator's death
// year is asked of Wikidata again (not from the cache). One page request
// per book, two seconds apart.
//
//   npx tsx scripts/gutenberg-spot-check.ts         (after gutenberg-import.ts)
//   npx tsx scripts/gutenberg-spot-check.ts --all   (after gutenberg-all.ts)
//
// Writes data/gutenberg-spot-check.md, or with --all
// data/gutenberg-all-spot-check.md: there each book's row in the import
// files is checked too (its Gutenberg link and rights note, an English
// title, the translator credited), and its category and description are
// listed for reading.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { askLiveOnly, networkCalls, USER_AGENT } from "./wikisource/http";
import { peopleByWikipedia } from "./gutenberg/wikidata";

askLiveOnly();
const PD_CUTOFF = new Date().getUTCFullYear() - 61;
type P = { name: string; wikipedia: string[]; year: number };
type Sample = { id: number; title: string; authors: P[]; translators: P[] };
type ImportRow = { title: string; author: string; translator?: string | null; category: string; description: string; sources?: { url: string; rightsBasis: string }[] };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ALL = process.argv.includes("--all");
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

// The rows of the whole-catalog import files, by Gutenberg ebook number.
function allRows(): Map<number, ImportRow> {
  const out = new Map<number, ImportRow>();
  for (const f of readdirSync("data").filter((n) => /^gutenberg-all-\d+\.json$/.test(n))) {
    for (const row of JSON.parse(readFileSync(`data/${f}`, "utf8")) as ImportRow[]) {
      const id = Number(row.sources?.[0]?.url.match(/gutenberg\.org\/ebooks\/(\d+)$/)?.[1]);
      if (id) out.set(id, row);
    }
  }
  return out;
}

// What a row needs besides the rules every import checks for itself.
// The row's authors are checked against the page's own byline ("… by Jane
// Austen | Project Gutenberg"): each one's surname must be in it.
function rowProblems(s: Sample, row: ImportRow | undefined, pageTitle: string | null): string[] {
  if (!row) return ["not in the import files"];
  const problems: string[] = [];
  const byline = pageTitle?.match(/\bby\s+(.*?)(\s*\|\s*Project Gutenberg)?$/i)?.[1] ?? null;
  const letters = (t: string) => t.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  if (byline !== null)
    for (const name of row.author.split(/,\s+|\s+ও\s+/)) {
      const last = letters(name.split(/\s+/).pop() ?? "");
      if (last && !letters(byline).includes(last)) problems.push(`author “${name}” isn't on the page (“by ${byline}”)`);
    }
  const source = row.sources?.[0];
  if (source?.url !== `https://www.gutenberg.org/ebooks/${s.id}`) problems.push("no Gutenberg link");
  if (!source?.rightsBasis.includes("প্রজেক্ট গুটেনবার্গ")) problems.push("rights note doesn't name Project Gutenberg");
  if (!/[A-Za-z]/.test(row.title)) problems.push("title isn't in English");
  if (s.translators.length > 0 && (!row.translator || !source?.rightsBasis.includes("অনুবাদক"))) problems.push("translator not credited");
  if (/[0-9]/.test(row.description)) problems.push("description has Latin digits");
  return problems;
}

async function main() {
  const sample = JSON.parse(readFileSync(`data/.gutenberg-cache/${ALL ? "spot-check-all-sample" : "spot-check-sample"}.json`, "utf8")) as Sample[];
  const rowsById = ALL ? allRows() : new Map<number, ImportRow>();
  const people = sample.flatMap((s) => [...s.authors, ...s.translators]);
  const facts = await peopleByWikipedia([...new Set(people.flatMap((p) => p.wikipedia.filter((u) => /\/\/en\.wikipedia\.org\//.test(u))))]);

  const rows: string[] = [];
  const notes: string[] = [];
  let passed = 0;
  for (const [i, s] of sample.entries()) {
    const problems: string[] = [];
    const url = `https://www.gutenberg.org/ebooks/${s.id}`;
    let pageNote = "";
    let pageTitle: string | null = null;
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      const html = await res.text();
      pageTitle = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "";
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

    const row = rowsById.get(s.id);
    if (ALL) problems.push(...rowProblems(s, row, pageTitle));
    const ok = problems.length === 0;
    if (ok) passed++;
    else notes.push(`- **${s.title}**: ${problems.join("; ")}`);
    const book = `[${cell(s.title)}](${url})${row?.translator ? `<br>tr. ${cell(row.translator)}` : ""}`;
    rows.push(
      ALL
        ? `| ${i + 1} | ${book} | ${row?.category ?? "—"} | ${cell(row?.description ?? "—")} | ${died.join("<br>")} | ${pageNote} | ${ok ? "✓ pass" : "✗ see below"} |`
        : `| ${i + 1} | ${book} | ${died.join("<br>")} | ${pageNote} | ${ok ? "✓ pass" : "✗ see below"} |`
    );
    console.log(`  ${i + 1}/${sample.length} ${ok ? "pass" : "FAIL"} ${s.title}`);
  }

  writeFileSync(
    ALL ? "data/gutenberg-all-spot-check.md" : "data/gutenberg-spot-check.md",
    [
      ALL ? "# Spot-check, whole-catalog Gutenberg import" : "# Spot-check, Gutenberg import",
      "",
      `Checked ${new Date().toISOString().slice(0, 10)} by \`scripts/gutenberg-spot-check.ts${ALL ? " --all" : ""}\`, live (${networkCalls} Wikidata requests, ${sample.length} Gutenberg page requests). A ${ALL ? "random " : ""}sample of ${sample.length} new books.`,
      "",
      `**${passed} of ${sample.length} passed.** Each book's page answered and is that book, and every author and translator died in ${PD_CUTOFF} or earlier, with Wikidata (asked again) agreeing where it has the person.` +
        (ALL
          ? " Each row names the authors on the book's page, links that page with a rights note naming Project Gutenberg, has an English title, and credits its translator."
          : ""),
      "",
      ...(ALL
        ? ["| # | Book | Category | Description | Died | Gutenberg page | Result |", "|---|---|---|---|---|---|---|"]
        : ["| # | Book | Died | Gutenberg page | Result |", "|---|---|---|---|---|"]),
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
