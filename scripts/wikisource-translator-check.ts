// Re-checks, live on Wikidata, everyone the import names as the writer of a
// work's Bangla text (translators, and Bangla writers credited as author for
// a retelling): that the item is the person it should be (label, what
// Wikidata says they are, life dates), and that their death year still
// passes the rule. Nothing cached is read and nothing is written back.
//
//   npx tsx scripts/wikisource-translator-check.ts
//
// Reads data/.wikisource-cache/translator-check.json (written by
// scripts/wikisource-import.ts); writes data/wikisource-translator-check.md.
import { readFileSync, writeFileSync } from "node:fs";
import { askLiveOnly, postForm, WIKIDATA_API } from "./wikisource/http";
import { deathOf, type Entity } from "./wikisource/wikidata";
import { PD_CUTOFF } from "./wikisource/candidates";
import { CONFIRMED_DEATHS } from "./wikisource/death-years";

askLiveOnly();

type Writer = { id: string; name: string; role: string; deathYear: number | null; when: string };
type Check = { batch: string; title: string; url: string; original: string; writers: Writer[] };
const checks = JSON.parse(readFileSync("data/.wikisource-cache/translator-check.json", "utf8")) as Check[];

type Full = Entity & { descriptions?: Record<string, { value: string }> };

async function entities(ids: string[]): Promise<Map<string, Full>> {
  const out = new Map<string, Full>();
  const unique = [...new Set(ids)].sort();
  for (let i = 0; i < unique.length; i += 50) {
    const json = await postForm<{ entities?: Record<string, Full> }>(WIKIDATA_API, {
      action: "wbgetentities",
      format: "json",
      ids: unique.slice(i, i + 50).join("|"),
      props: "labels|descriptions|claims",
      languages: "bn|en",
    });
    for (const [id, e] of Object.entries(json.entities ?? {})) out.set(id, e);
  }
  return out;
}

const birthYear = (e: Full | undefined) => {
  const v = e?.claims?.P569?.[0]?.mainsnak.datavalue?.value as { time?: string } | undefined;
  return v?.time ? Number(v.time.match(/^([+-]\d+)-/)?.[1]) : null;
};

async function main() {
  const people = await entities(checks.flatMap((c) => c.writers.map((w) => w.id)));
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  const lines: string[] = [];
  const L = (s = "") => lines.push(s);
  let failures = 0;
  const rows: string[] = [];
  for (const c of [...checks].sort((a, b) => a.batch.localeCompare(b.batch) || a.title.localeCompare(b.title, "bn"))) {
    for (const w of c.writers) {
      const e = people.get(w.id);
      const death = deathOf(e);
      const confirmed = CONFIRMED_DEATHS[w.id];
      const year = death?.year ?? confirmed?.year ?? null;
      const ok = year !== null && year <= PD_CUTOFF && (w.deathYear === null || year === w.deathYear || confirmed !== undefined);
      if (!ok) failures++;
      const who = `${e?.labels?.bn?.value ?? "—"} / ${e?.labels?.en?.value ?? "—"}`;
      const what = e?.descriptions?.en?.value ?? e?.descriptions?.bn?.value ?? "—";
      const life = `${birthYear(e) ?? "?"}–${death ? death.year : confirmed ? `${confirmed.year} (from ${confirmed.sources[0].url})` : "?"}`;
      rows.push(
        `| ${c.batch} | ${cell(c.title)} | ${cell(w.name)} (${w.role}) | [${w.id}](https://www.wikidata.org/wiki/${w.id}): ${cell(who)} — ${cell(what)} | ${cell(life)} | ${ok ? "yes" : "**no**"} |`
      );
    }
  }
  L("# Translators and Bangla writers — live Wikidata re-check");
  L();
  L(`Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/wikisource-translator-check.ts\`, asking Wikidata live (no cache). For each work whose original is in another language or older than Bangla prose: who wrote the Bangla text, what Wikidata says that person is, their life dates, and whether the death year passes the rule (${PD_CUTOFF} or earlier) and matches the import's.`);
  L();
  L(failures ? `**${failures} check(s) failed** — see the rows marked **no**.` : `**All ${rows.length} pass.**`);
  L();
  L("| Batch | Work | Bangla text by | Wikidata item | Lived | Passes |");
  L("|---|---|---|---|---|---|");
  for (const r of rows) L(r);
  writeFileSync("data/wikisource-translator-check.md", lines.join("\n") + "\n");
  console.log(`${rows.length} writers checked live; failures: ${failures}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
