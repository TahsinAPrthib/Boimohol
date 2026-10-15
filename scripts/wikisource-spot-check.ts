// Re-checks a random sample of the Wikisource import against live data,
// bypassing the cache the import ran on:
//   - each author's (and translator's or editor's) death year, asked of
//     Wikidata again and compared with a second, independent list below;
//   - that the work's scan is still in a "100% proofread" category on
//     bn.wikisource, and that the main page still transcludes it with every
//     transcluded page proofread.
// The results replace the spot-check section of data/wikisource-report.md.
//
//   npx tsx scripts/wikisource-spot-check.ts      (after wikisource-import.ts)
import { readFileSync, writeFileSync } from "node:fs";
import { mwQueryAll, networkCalls, askLiveOnly, WIKISOURCE_API } from "./wikisource/http";
import { getEntities, latestYears } from "./wikisource/wikidata";
import { verifyWork, type Verification } from "./wikisource/verify";
import { COMPLETE_CATEGORIES } from "./wikisource/indexes";
import { PD_CUTOFF } from "./wikisource/candidates";

askLiveOnly();

type Person = { id: string; nameBn: string | null; nameEn: string | null; deathYear: number | null };
type Sample = {
  row: { titleBangla: string; author: string; authorDeathYear: number; sources: { url: string }[] };
  authors: Person[];
  translators: Person[];
  editors: Person[];
  scans: string[];
  mainPage: string;
  v: Verification;
};

// A second source for death years, independent of Wikidata: written down by
// hand from general reference knowledge (not looked up by this script). An
// author missing here is checked against Wikidata alone, and the report says
// so.
const KNOWN_DEATH_YEARS: [bn: string, en: string, year: number][] = [
  ["রবীন্দ্রনাথ ঠাকুর", "Rabindranath Tagore", 1941],
  ["বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "Bankim Chandra Chattopadhyay", 1894],
  ["শরৎচন্দ্র চট্টোপাধ্যায়", "Sarat Chandra Chattopadhyay", 1938],
  ["মাইকেল মধুসূদন দত্ত", "Michael Madhusudan Dutt", 1873],
  ["ঈশ্বরচন্দ্র বিদ্যাসাগর", "Ishwar Chandra Vidyasagar", 1891],
  ["দীনবন্ধু মিত্র", "Dinabandhu Mitra", 1873],
  ["কালীপ্রসন্ন সিংহ", "Kaliprasanna Singha", 1870],
  ["প্যারীচাঁদ মিত্র", "Peary Chand Mitra", 1883],
  ["দ্বিজেন্দ্রলাল রায়", "Dwijendralal Ray", 1913],
  ["সুকুমার রায়", "Sukumar Ray", 1923],
  ["উপেন্দ্রকিশোর রায়চৌধুরী", "Upendrakishore Ray Chowdhury", 1915],
  ["বেগম রোকেয়া", "Begum Rokeya", 1932],
  ["জীবনানন্দ দাশ", "Jibanananda Das", 1954],
  ["বিভূতিভূষণ বন্দ্যোপাধ্যায়", "Bibhutibhushan Bandyopadhyay", 1950],
  ["মানিক বন্দ্যোপাধ্যায়", "Manik Bandopadhyay", 1956],
  ["সত্যেন্দ্রনাথ দত্ত", "Satyendranath Dutta", 1922],
  ["স্বামী বিবেকানন্দ", "Swami Vivekananda", 1902],
  ["রমেশচন্দ্র দত্ত", "Romesh Chunder Dutt", 1909],
  ["নবীনচন্দ্র সেন", "Nabinchandra Sen", 1909],
  ["হেমচন্দ্র বন্দ্যোপাধ্যায়", "Hemchandra Banerjee", 1903],
  ["গিরিশচন্দ্র ঘোষ", "Girish Chandra Ghosh", 1912],
  ["মীর মশাররফ হোসেন", "Mir Mosharraf Hossain", 1911],
  ["কামিনী রায়", "Kamini Roy", 1933],
  ["অক্ষয়কুমার দত্ত", "Akshay Kumar Datta", 1886],
  ["দক্ষিণারঞ্জন মিত্র মজুমদার", "Dakshinaranjan Mitra Majumder", 1957],
  ["অবনীন্দ্রনাথ ঠাকুর", "Abanindranath Tagore", 1951],
  ["যোগীন্দ্রনাথ সরকার", "Jogindranath Sarkar", 1937],
  ["রাজশেখর বসু", "Rajshekhar Basu", 1960],
  ["প্রভাতকুমার মুখোপাধ্যায়", "Prabhat Kumar Mukhopadhyay", 1932],
  ["স্বর্ণকুমারী দেবী", "Swarnakumari Devi", 1932],
  ["হরপ্রসাদ শাস্ত্রী", "Haraprasad Shastri", 1931],
  ["কেদারনাথ বন্দ্যোপাধ্যায়", "Kedarnath Bandopadhyay", 1949],
  ["প্রমথ চৌধুরী", "Pramatha Chaudhuri", 1946],
  ["মোহিতলাল মজুমদার", "Mohitlal Majumdar", 1952],
  ["হেমেন্দ্রকুমার রায়", "Hemendra Kumar Roy", 1963],
  ["নিরুপমা দেবী", "Nirupama Devi", 1951],
  ["অনুরূপা দেবী", "Anurupa Devi", 1958],
  ["রঙ্গলাল বন্দ্যোপাধ্যায়", "Rangalal Bandyopadhyay", 1887],
  ["মদনমোহন তর্কালঙ্কার", "Madan Mohan Tarkalankar", 1858],
  ["রাজনারায়ণ বসু", "Rajnarayan Basu", 1899],
  ["দেবেন্দ্রনাথ ঠাকুর", "Debendranath Tagore", 1905],
  ["জ্যোতিরিন্দ্রনাথ ঠাকুর", "Jyotirindranath Tagore", 1925],
  ["সত্যেন্দ্রনাথ ঠাকুর", "Satyendranath Tagore", 1923],
  ["দ্বিজেন্দ্রনাথ ঠাকুর", "Dwijendranath Tagore", 1926],
  ["রজনীকান্ত সেন", "Rajanikanta Sen", 1910],
  ["অতুলপ্রসাদ সেন", "Atul Prasad Sen", 1934],
  ["করুণানিধান বন্দ্যোপাধ্যায়", "Karunanidhan Bandyopadhyay", 1955],
  ["যতীন্দ্রমোহন বাগচী", "Jatindramohan Bagchi", 1948],
  ["ঈশ্বরচন্দ্র গুপ্ত", "Ishwar Chandra Gupta", 1859],
  ["দীনেশচন্দ্র সেন", "Dinesh Chandra Sen", 1939],
  ["শিবনাথ শাস্ত্রী", "Sivanath Sastri", 1919],
  ["বিপিনচন্দ্র পাল", "Bipin Chandra Pal", 1932],
  ["ভগিনী নিবেদিতা", "Sister Nivedita", 1911],
  ["রামকৃষ্ণ পরমহংস", "Ramakrishna", 1886],
  ["কেশবচন্দ্র সেন", "Keshub Chunder Sen", 1884],
  ["রামমোহন রায়", "Ram Mohan Roy", 1833],
  ["ভূদেব মুখোপাধ্যায়", "Bhudev Mukhopadhyay", 1894],
  ["জগদীশচন্দ্র বসু", "Jagadish Chandra Bose", 1937],
  ["প্রফুল্লচন্দ্র রায়", "Prafulla Chandra Ray", 1944],
  ["রামেন্দ্রসুন্দর ত্রিবেদী", "Ramendra Sundar Tribedi", 1919],
  ["দীনেন্দ্রকুমার রায়", "Dinendra Kumar Roy", 1943],
  ["ক্ষীরোদপ্রসাদ বিদ্যাবিনোদ", "Kshirode Prasad Vidyavinode", 1927],
  ["অমৃতলাল বসু", "Amritlal Basu", 1929],
  ["সঞ্জীবচন্দ্র চট্টোপাধ্যায়", "Sanjib Chandra Chattopadhyay", 1889],
  ["তারকনাথ গঙ্গোপাধ্যায়", "Taraknath Gangopadhyay", 1891],
  ["ভারতচন্দ্র রায়গুণাকর", "Bharatchandra Ray", 1760],
  ["শরৎকুমারী চৌধুরাণী", "Sarat Kumari Chaudhurani", 1920],
  ["ইন্দিরা দেবী চৌধুরানী", "Indira Devi Chaudhurani", 1960],
  ["সরলা দেবী চৌধুরানী", "Sarala Devi Chaudhurani", 1945],
  ["বলেন্দ্রনাথ ঠাকুর", "Balendranath Tagore", 1899],
  ["কাঙাল হরিনাথ", "Kangal Harinath", 1896],
  ["প্রবোধকুমার বন্দ্যোপাধ্যায়", "Prabodh Kumar Bandyopadhyay", 1956], // Manik Bandopadhyay's legal name
  ["মানিক বন্দ্যোপাধ্যায়", "Manik Bandopadhyay", 1956],
  ["মোহনদাস করমচাঁদ গান্ধী", "Mahatma Gandhi", 1948],
  ["ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়", "Brajendranath Bandyopadhyay", 1952],
  ["সজনীকান্ত দাস", "Sajanikanta Das", 1962],
  ["সখারাম গণেশ দেউস্কর", "Sakharam Ganesh Deuskar", 1912],
  ["চন্দ্রনাথ বসু", "Chandranath Basu", 1910],
  ["জওহরলাল নেহরু", "Jawaharlal Nehru", 1964],
  ["সুকান্ত ভট্টাচার্য", "Sukanta Bhattacharya", 1947],
  ["অদ্বৈত মল্লবর্মণ", "Advaita Mallabarman", 1951],
  ["সুভাষচন্দ্র বসু", "Subhas Chandra Bose", 1945],
  ["গোলাম মোস্তফা", "Golam Mostofa", 1964],
  ["রাখালদাস বন্দ্যোপাধ্যায়", "Rakhaldas Bandyopadhyay", 1930],
  ["ত্রৈলোক্যনাথ মুখোপাধ্যায়", "Trailokyanath Mukhopadhyay", 1919],
];
const norm = (s: string | null) => (s ?? "").normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
function knownYear(p: Person): number | null {
  const hit = KNOWN_DEATH_YEARS.find(([bn, en]) => norm(bn) === norm(p.nameBn) || norm(en) === norm(p.nameEn));
  return hit ? hit[2] : null;
}

async function inCompleteCategory(file: string): Promise<boolean> {
  const [page] = await mwQueryAll(WIKISOURCE_API, {
    titles: `নির্ঘণ্ট:${file}`,
    prop: "categories",
    clcategories: COMPLETE_CATEGORIES.join("|"),
  });
  return ((page?.categories as unknown[] | undefined) ?? []).length > 0;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const bnName = (p: Person) => p.nameBn ?? p.nameEn ?? p.id;

async function main() {
  const sample = JSON.parse(readFileSync("data/.wikisource-cache/spot-check-sample.json", "utf8")) as Sample[];
  const people = sample.flatMap((s) => [...s.authors, ...s.translators, ...s.editors]);
  const entities = await getEntities(people.map((p) => p.id));

  const rows: string[] = [];
  const notes: string[] = [];
  let passed = 0;
  for (const [i, s] of sample.entries()) {
    const problems: string[] = [];

    const deaths = [...s.authors, ...s.translators, ...s.editors].map((p) => {
      const liveYears = latestYears(entities.get(p.id), "P570");
      const liveYear = liveYears.length ? Math.max(...liveYears) : null;
      const known = knownYear(p);
      if (liveYear === null) problems.push(`Wikidata no longer gives a death year for ${bnName(p)}`);
      else if (liveYear !== p.deathYear) problems.push(`${bnName(p)}: the import used ${p.deathYear}, Wikidata now says ${liveYear}`);
      if (liveYear !== null && liveYear > PD_CUTOFF) problems.push(`${bnName(p)} died after ${PD_CUTOFF}`);
      if (known !== null && liveYear !== null && known !== liveYear) problems.push(`${bnName(p)}: Wikidata says ${liveYear}, the independent list says ${known}`);
      return { p, liveYear, known };
    });

    const all = { has: () => true } as unknown as Set<string>;
    const v = await verifyWork(s.mainPage, s.scans[0], all);
    if (!v.ok) problems.push(`Wikisource: ${v.reason}`);
    const complete: (readonly [string, boolean])[] = [];
    for (const f of v.transcludedFiles) complete.push([f, await inCompleteCategory(f)] as const);
    for (const [f, ok] of complete) if (!ok) problems.push(`${f} is no longer in a 100% proofread category`);
    if (v.categories.some((c) => /অসম্পূর্ণ/.test(c))) problems.push("the main page is categorised as incomplete");

    const ok = problems.length === 0;
    if (ok) passed++;
    else notes.push(`- **${s.row.titleBangla}**: ${problems.join("; ")}`);

    const died = deaths
      .map(({ p, liveYear, known }) => `${bnName(p)}: ${liveYear ?? "?"}${known === null ? " (not on the independent list)" : known === liveYear ? " ✓" : ` ≠ ${known}`}`)
      .join("<br>");
    rows.push(
      `| ${i + 1} | [${s.row.titleBangla}](${s.row.sources[0].url}) | ${died} | ${complete.filter(([, c]) => c).length}/${complete.length} | ${v.textPages} / ${v.validatedPages} of ${v.pagesInScan} | ${pct(v.coverage)}${v.subpages ? `, ${v.subpages} subpages` : ""} | ${ok ? "✓ pass" : "✗ see below"} |`
    );
    console.log(`  ${i + 1}/${sample.length} ${ok ? "pass" : "FAIL"} ${s.row.titleBangla}`);
  }

  const known = sample.flatMap((s) => [...s.authors, ...s.translators, ...s.editors]).filter((p) => knownYear(p) !== null).length;
  const section = [
    `Checked ${new Date().toISOString().slice(0, 10)} by \`scripts/wikisource-spot-check.ts\`, live, not from the import's cache (${networkCalls} requests). A seeded random sample of ${sample.length} of the included works (ready and pending).`,
    "",
    `**${passed} of ${sample.length} passed.** For each work:`,
    "- **Died:** the death year Wikidata gives now, for every author, translator and editor, compared with an independent list of death years written down by hand (✓ = they agree). " +
      `${known} of the ${sample.reduce((n, s) => n + s.authors.length + s.translators.length + s.editors.length, 0)} people are on that list.`,
    "- **Scans complete:** how many of the scans the main page transcludes are still in a 100% proofread category on bn.wikisource.",
    "- **Pages:** the scan's proofread pages / validated pages, of all its pages; and the share of its proofread pages that the main page (and its chapter subpages) transcludes. Every transcluded page was confirmed proofread or validated.",
    "",
    "| # | Work | Died (Wikidata now; independent list) | Scans complete | Pages proofread / validated | On the main page | Result |",
    "|---|---|---|---|---|---|---|",
    ...rows,
    "",
    ...(notes.length ? ["Problems found:", "", ...notes] : ["No problems found."]),
  ].join("\n");

  const report = readFileSync("data/wikisource-report.md", "utf8");
  const start = report.indexOf("## Spot-check");
  const bodyStart = report.indexOf("\n", start) + 1;
  const next = report.indexOf("\n## ", bodyStart);
  writeFileSync("data/wikisource-report.md", report.slice(0, bodyStart) + "\n" + section + "\n" + (next >= 0 ? report.slice(next) : ""));
  console.log(`\n${passed}/${sample.length} passed; ${networkCalls} live requests`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
