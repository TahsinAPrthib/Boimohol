// Turns Project Gutenberg's official RDF catalog feed into a compact JSON
// list, in one streaming pass over the archive (never the website).
//
//   1. Download once (into the gitignored cache):
//      https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2
//      -> data/.gutenberg-cache/rdf-files.tar.bz2
//   2. Unpack it into one file, dropping the file-format listings (most of
//      each record, and not needed), from Git Bash:
//      bzip2 -dc rdf-files.tar.bz2 | tar -xOf - |
//        awk '/<dcterms:hasFormat>/{skip=1} !skip{print} /<\/dcterms:hasFormat>/{skip=0}' > rdf-slim.xml
//      (Piping bzip2 into Node directly fails on Windows with "Invalid
//      argument", hence the file.)
//   3. npx tsx scripts/gutenberg/catalog.ts
//      -> data/.gutenberg-cache/catalog.json
import { createReadStream, writeFileSync } from "node:fs";

export type Agent = { id: string; name: string; aliases: string[]; birth: number | null; death: number | null; wikipedia: string[] };
export type Ebook = {
  id: number;
  title: string;
  type: string | null;
  languages: string[];
  issued: string | null;
  downloads: number;
  // role -> agents: "aut" (creator), "trl", "edt", "ill", "com", "ctb", ...
  roles: Record<string, Agent[]>;
  lcsh: string[];
  lcc: string[];
  bookshelves: string[];
  wikipedia: string | null; // "Wikipedia page about this book: …"
};

const SLIM = "data/.gutenberg-cache/rdf-slim.xml";
const OUT = "data/.gutenberg-cache/catalog.json";

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const one = (doc: string, re: RegExp) => {
  const m = doc.match(re);
  return m ? decode(m[1]) : null;
};
const all = (doc: string, re: RegExp) => [...doc.matchAll(re)].map((m) => decode(m[1]));
const year = (s: string | null) => (s && /^-?\d+$/.test(s) ? Number(s) : null);

function parseAgent(id: string, body: string): Agent {
  return {
    id,
    name: one(body, /<pgterms:name>([\s\S]*?)<\/pgterms:name>/) ?? "",
    aliases: all(body, /<pgterms:alias>([\s\S]*?)<\/pgterms:alias>/g),
    birth: year(one(body, /<pgterms:birthdate[^>]*>([\s\S]*?)<\/pgterms:birthdate>/)),
    death: year(one(body, /<pgterms:deathdate[^>]*>([\s\S]*?)<\/pgterms:deathdate>/)),
    wikipedia: [...body.matchAll(/<pgterms:webpage rdf:resource="(https?:\/\/[a-z]+\.wikipedia\.org\/[^"]+)"/g)].map((m) => decode(m[1])),
  };
}

export function parseDocument(doc: string): Ebook | null {
  const id = doc.match(/<pgterms:ebook rdf:about="ebooks\/(\d+)"/);
  if (!id) return null;
  // Agents are defined inline under their first role and may be referred to
  // again by rdf:resource.
  const agents = new Map<string, Agent>();
  for (const m of doc.matchAll(/<pgterms:agent rdf:about="2009\/agents\/(\d+)">([\s\S]*?)<\/pgterms:agent>/g)) agents.set(m[1], parseAgent(m[1], m[2]));
  const roles: Record<string, Agent[]> = {};
  const add = (role: string, agentId: string) => {
    const a = agents.get(agentId);
    if (!a) return;
    const list = (roles[role] ??= []);
    if (!list.some((x) => x.id === a.id)) list.push(a);
  };
  for (const m of doc.matchAll(/<(dcterms:creator|marcrel:(\w+))>\s*<pgterms:agent rdf:about="2009\/agents\/(\d+)">/g)) add(m[2] ?? "aut", m[3]);
  for (const m of doc.matchAll(/<(dcterms:creator|marcrel:(\w+)) rdf:resource="2009\/agents\/(\d+)"\s*\/>/g)) add(m[2] ?? "aut", m[3]);

  const valuesUnder = (tag: string, memberOf?: string) =>
    [...doc.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))]
      .map((m) => m[1])
      .filter((b) => !memberOf || b.includes(memberOf))
      .map((b) => one(b, /<rdf:value[^>]*>([\s\S]*?)<\/rdf:value>/))
      .filter((v): v is string => Boolean(v));

  const description = all(doc, /<dcterms:description>([\s\S]*?)<\/dcterms:description>/g).find((d) => d.startsWith("Wikipedia page about this book:"));
  return {
    id: Number(id[1]),
    // The title's first line: Gutenberg puts the subtitle on the next one.
    title: decode((doc.match(/<dcterms:title>([\s\S]*?)<\/dcterms:title>/)?.[1] ?? "").split(/\r?\n/).find((l) => l.trim()) ?? ""),
    type: valuesUnder("dcterms:type")[0] ?? null,
    languages: valuesUnder("dcterms:language"),
    issued: one(doc, /<dcterms:issued[^>]*>([\s\S]*?)<\/dcterms:issued>/),
    downloads: Number(one(doc, /<pgterms:downloads[^>]*>([\s\S]*?)<\/pgterms:downloads>/) ?? 0),
    roles,
    lcsh: valuesUnder("dcterms:subject", "/LCSH"),
    lcc: valuesUnder("dcterms:subject", "/LCC"),
    bookshelves: valuesUnder("pgterms:bookshelf"),
    wikipedia: description ? description.replace("Wikipedia page about this book:", "").trim() : null,
  };
}

async function main() {
  const books: Ebook[] = [];
  let buffer = "";
  const flush = (final: boolean) => {
    const parts = buffer.split("<?xml ");
    buffer = final ? "" : parts.pop() ?? "";
    for (const p of parts) {
      const book = parseDocument(p);
      if (book) books.push(book);
    }
  };
  for await (const chunk of createReadStream(SLIM, { encoding: "utf8" })) {
    buffer += chunk;
    if (buffer.length > 4_000_000) flush(false);
    if (books.length && books.length % 10000 < 20) process.stdout.write(`\r${books.length} records`);
  }
  flush(true);
  books.sort((a, b) => a.id - b.id);
  writeFileSync(OUT, JSON.stringify(books));
  console.log(`\n${books.length} records -> ${OUT}`);
}

if (process.argv[1]?.endsWith("catalog.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
