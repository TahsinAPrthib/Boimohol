// Applies the Bangla-title rule (2026-10-16) to the catalog's own foreign
// books: a Bangla title is shown only when it is a genuine, well-established
// one (অপরাধ ও শাস্তি); a transliteration of the English (দ্য টাইম মেশিন)
// becomes a hidden search alias, so a search in Bangla script still finds
// the book. Nothing is written to a database: the output is a file of
// update rows for the admin import (/admin/books), optional to upload.
//
//   npx tsx scripts/catalog-title-corrections.ts
//
// Reads data/catalog-import.json (the catalog as imported); writes
// data/catalog-title-corrections.json.
import { readFileSync, writeFileSync } from "node:fs";
import { bookUpdateRowSchema } from "../src/lib/book-schema";

// By English title: Bangla titles that are translations or the work's own
// Bangla name, checked by hand.
const GENUINE = new Set([
  "Crime and Punishment", // অপরাধ ও শাস্তি
  "The Diary of a Young Girl", // আনা ফ্রাঙ্কের ডায়েরি
  "Sultana's Dream", // সুলতানার স্বপ্ন: Rokeya's own story, known by its Bangla name
  "Karma Yoga", // কর্মযোগ
]);

type CatalogRow = { title: string; titleBangla?: string | null; author: string; language: string };
const catalog = JSON.parse(readFileSync("data/catalog-import.json", "utf8")) as CatalogRow[];

const rows = catalog
  .filter((b) => b.language !== "bn" && b.titleBangla && !GENUINE.has(b.title))
  .map((b) => ({
    match: { title: b.title, titleBangla: b.titleBangla!, author: b.author },
    set: { titleBangla: null, searchAliases: [b.titleBangla!] },
  }));

for (const r of rows) {
  const check = bookUpdateRowSchema.safeParse(r);
  if (!check.success) throw new Error(`"${r.match.title}": ${check.error.issues.map((i) => i.message).join("; ")}`);
}
writeFileSync("data/catalog-title-corrections.json", JSON.stringify(rows, null, 2) + "\n");
console.log(`${rows.length} catalog books: Bangla title moved to a search alias; kept: ${[...GENUINE].join(", ")}`);
