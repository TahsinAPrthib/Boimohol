// The texts database: Gutenberg books made into reader pages
// (src/lib/gutenberg/parse.ts), compressed. A separate free Neon project
// (TEXTS_DATABASE_URL), never the site's own database: if it fills up or
// runs out of transfer, only the Gutenberg reader stops, and the book page
// still offers the Gutenberg link.
//
// - The 1,000 books the seed workflow stores are pinned and never removed.
// - Books stored on demand (the first time someone opens them) are capped at
//   TEXTS_CACHE_MAX_MB (default 500 MB, compressed): above it, those read
//   longest ago go first, as in the Wikisource cache.
// - A book that couldn't be fetched is remembered as failed for a while, so
//   a broken one doesn't send a request to the mirror on every visit.
//
// The tables are created on first use. Plain SQL through `pg`: no ORM, no
// migrations to run against this database.
import { Pool, type PoolClient } from "pg";
import { brotliCompressSync, brotliDecompressSync, constants } from "node:zlib";
import type { GutenbergBook } from "./parse";

export const textsConfigured = () => Boolean(process.env.TEXTS_DATABASE_URL);

export function cacheCapBytes(): number {
  const mb = Number(process.env.TEXTS_CACHE_MAX_MB);
  return (Number.isFinite(mb) && mb > 0 ? mb : 500) * 1024 * 1024;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS gutenberg_book (
  ebook_id   integer PRIMARY KEY,
  status     text NOT NULL CHECK (status IN ('ready', 'failed')),
  version    integer NOT NULL,
  pinned     boolean NOT NULL DEFAULT false,
  contents   jsonb,
  bytes      integer NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gutenberg_book_unpinned_read_at ON gutenberg_book (read_at) WHERE NOT pinned;
CREATE TABLE IF NOT EXISTS gutenberg_page (
  ebook_id integer NOT NULL REFERENCES gutenberg_book (ebook_id) ON DELETE CASCADE,
  n        integer NOT NULL,
  html     bytea NOT NULL,
  PRIMARY KEY (ebook_id, n)
);`;

let pool: Pool | null = null;
let schema: Promise<void> | null = null;

async function db(): Promise<Pool> {
  if (!process.env.TEXTS_DATABASE_URL) throw new Error("TEXTS_DATABASE_URL is not set");
  pool ??= new Pool({ connectionString: process.env.TEXTS_DATABASE_URL, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 15_000 });
  schema ??= pool.query(SCHEMA).then(
    () => undefined,
    (err) => {
      schema = null;
      throw err;
    }
  );
  await schema;
  return pool;
}

// For scripts: lets the process exit.
export async function closeTexts(): Promise<void> {
  await pool?.end();
  pool = null;
  schema = null;
}

const pack = (html: string) => brotliCompressSync(Buffer.from(html, "utf8"), { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
const unpack = (b: Buffer) => brotliDecompressSync(b).toString("utf8");

export type StoredEntry = { label: string; group: string | null };
export type StoredContents = { entries: StoredEntry[]; images: number; lang?: string | null };
// `missing`: a failure because the mirror has no HTML for the book.
export type StoredBook = { status: "ready" | "failed"; version: number; pinned: boolean; contents: StoredContents | null; missing: boolean; fetchedAt: Date; readAt: Date };

export async function readBook(ebookId: number): Promise<StoredBook | null> {
  const { rows } = await (await db()).query(
    "SELECT status, version, pinned, contents, fetched_at, read_at FROM gutenberg_book WHERE ebook_id = $1",
    [ebookId]
  );
  const r = rows[0];
  if (!r) return null;
  const failed = r.status === "failed";
  return { status: r.status, version: r.version, pinned: r.pinned, contents: failed ? null : r.contents, missing: failed && r.contents?.missing === true, fetchedAt: r.fetched_at, readAt: r.read_at };
}

// A page: 0 is the front page, 1.. the chapters.
export async function readPage(ebookId: number, n: number): Promise<string | null> {
  const { rows } = await (await db()).query("SELECT html FROM gutenberg_page WHERE ebook_id = $1 AND n = $2", [ebookId, n]);
  return rows[0] ? unpack(rows[0].html) : null;
}

// Stores a book whole, replacing any older copy; a pinned book stays pinned.
// Returns its size as stored.
export async function saveBook(ebookId: number, book: GutenbergBook, opts: { version: number; pinned: boolean }): Promise<number> {
  const pages = [book.front, ...book.pages.map((p) => p.html)].map(pack);
  const contents: StoredContents = { entries: book.pages.map((p) => ({ label: p.label, group: p.group })), images: book.images, lang: book.lang };
  const bytes = pages.reduce((n, b) => n + b.length, 0) + Buffer.byteLength(JSON.stringify(contents));
  const client = await (await db()).connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO gutenberg_book (ebook_id, status, version, pinned, contents, bytes, fetched_at, read_at)
       VALUES ($1, 'ready', $2, $3, $4, $5, now(), now())
       ON CONFLICT (ebook_id) DO UPDATE SET status = 'ready', version = $2, pinned = gutenberg_book.pinned OR $3,
         contents = $4, bytes = $5, fetched_at = now(), read_at = now()`,
      [ebookId, opts.version, opts.pinned, JSON.stringify(contents), bytes]
    );
    await client.query("DELETE FROM gutenberg_page WHERE ebook_id = $1", [ebookId]);
    await insertPages(client, ebookId, pages);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  return bytes;
}

async function insertPages(client: PoolClient, ebookId: number, pages: Buffer[]) {
  for (let start = 0; start < pages.length; start += 100) {
    const batch = pages.slice(start, start + 100);
    const values = batch.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(", ");
    await client.query(`INSERT INTO gutenberg_page (ebook_id, n, html) VALUES ${values}`, [ebookId, ...batch.flatMap((html, i) => [start + i, html])]);
  }
}

// A failed fetch, unless a copy is already stored (that one stays in use).
export async function saveFailure(ebookId: number, version: number, missing: boolean): Promise<void> {
  await (await db()).query(
    `INSERT INTO gutenberg_book (ebook_id, status, version, contents) VALUES ($1, 'failed', $2, $3)
     ON CONFLICT (ebook_id) DO UPDATE SET fetched_at = now(), contents = EXCLUDED.contents WHERE gutenberg_book.status = 'failed'`,
    [ebookId, version, JSON.stringify({ missing })]
  );
}

export async function touchRead(ebookId: number): Promise<void> {
  await (await db()).query("UPDATE gutenberg_book SET read_at = now() WHERE ebook_id = $1", [ebookId]);
}

export type TextsReport = { removedFailed: number; removedOverCap: number; books: number; pinned: number; cachedBytes: number; pinnedBytes: number; capBytes: number };

// Forgets failures after a week; then, while the books stored on demand are
// over the cap, removes those read longest ago: the ones kept are the most
// recently read whose sizes add up to no more than the cap.
export async function pruneTexts(): Promise<TextsReport> {
  const capBytes = cacheCapBytes();
  const pg = await db();
  const failed = await pg.query("DELETE FROM gutenberg_book WHERE status = 'failed' AND fetched_at < now() - interval '7 days'");
  const over = await pg.query(
    `DELETE FROM gutenberg_book WHERE ebook_id IN (
       SELECT ebook_id FROM (
         SELECT ebook_id, SUM(bytes) OVER (ORDER BY read_at DESC, ebook_id) AS kept FROM gutenberg_book WHERE NOT pinned AND status = 'ready'
       ) ranked WHERE kept > $1
     )`,
    [capBytes]
  );
  const { rows } = await pg.query(
    `SELECT COUNT(*)::int AS books, COUNT(*) FILTER (WHERE pinned)::int AS pinned,
       COALESCE(SUM(bytes) FILTER (WHERE NOT pinned), 0)::bigint AS cached, COALESCE(SUM(bytes) FILTER (WHERE pinned), 0)::bigint AS pinned_bytes
     FROM gutenberg_book WHERE status = 'ready'`
  );
  return {
    removedFailed: failed.rowCount ?? 0,
    removedOverCap: over.rowCount ?? 0,
    books: rows[0].books,
    pinned: rows[0].pinned,
    cachedBytes: Number(rows[0].cached),
    pinnedBytes: Number(rows[0].pinned_bytes),
    capBytes,
  };
}
