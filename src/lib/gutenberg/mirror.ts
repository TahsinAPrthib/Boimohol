// Fetches a Gutenberg book's generated HTML from Project Gutenberg's own
// mirror, gutenberg.pglaf.org -- never from www.gutenberg.org, whose robot
// policy (gutenberg.org/policy/robot_access.html) keeps the site for people
// and blocks automated access. Politely:
// - a User-Agent naming the site and a contact address;
// - compressed (fetch asks for gzip by default);
// - one request at a time from each server, queued;
// - each book fetched once: it is then served from the texts database
//   (store.ts), and a failure is remembered for a while.
// The 1,000 books stored ahead of time come by rsync from the same mirror
// (.github/workflows/gutenberg-seed.yml).

const MIRROR = "https://gutenberg.pglaf.org";
const USER_AGENT = "BoiMohol/1.0 (https://boimohol-delta.vercel.app; tahsinaparthib1@gmail.com) gutenberg reader";

// Above this the book is too big to fetch on a visit (the giants outside the
// seed are link-only, src/lib/gutenberg/lists.json).
export const MAX_BOOK_BYTES = 40_000_000;
const TIMEOUT_MS = 120_000;

// The mirror couldn't be reached, or refused: the reader offers the
// Gutenberg link instead.
export class GutenbergUnavailable extends Error {}
// The mirror has no HTML for this book.
export class GutenbergMissing extends Error {}

// For checking the reader against files on disk in development only. Never
// read in production.
function mirror(): string {
  const override = process.env.GUTENBERG_MIRROR_URL;
  return override && process.env.NODE_ENV !== "production" ? override : MIRROR;
}

export const bookFileUrl = (ebookId: number) => `${mirror()}/cache/epub/${ebookId}/pg${ebookId}-images.html`;

let queue: Promise<unknown> = Promise.resolve();

export function fetchBookHtml(ebookId: number): Promise<string> {
  const run = () => download(ebookId);
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

async function download(ebookId: number): Promise<string> {
  let res: Response;
  try {
    res = await fetch(bookFileUrl(ebookId), { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  } catch (err) {
    throw new GutenbergUnavailable(`mirror unreachable: ${err instanceof Error ? err.message : err}`);
  }
  if (res.status === 404) throw new GutenbergMissing(`no HTML for #${ebookId}`);
  if (!res.ok || !res.body) throw new GutenbergUnavailable(`mirror answered ${res.status}`);
  // Read with a size limit (of the text as received, after decompression).
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = res.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BOOK_BYTES) {
        await reader.cancel();
        throw new GutenbergUnavailable(`#${ebookId} is over ${MAX_BOOK_BYTES} bytes`);
      }
      chunks.push(value);
    }
  } catch (err) {
    if (err instanceof GutenbergUnavailable) throw err;
    throw new GutenbergUnavailable(`download failed: ${err instanceof Error ? err.message : err}`);
  }
  return Buffer.concat(chunks).toString("utf8");
}
