import "server-only";
import { cache } from "react";
import { after } from "next/server";
import type { Loaded, TocEntry } from "@/lib/wikisource/reader";
import { fetchBookHtml, GutenbergMissing } from "./mirror";
import { BOOK_TOKEN, parseGutenbergHtml, PARSER_VERSION } from "./parse";
import { pruneTexts, readBook, readPage, saveBook, saveFailure, touchRead, type StoredBook } from "./store";

// The in-site reader's data for a Project Gutenberg book: its contents and
// pages, from the texts database (store.ts); the first time anyone opens a
// book that isn't stored, it is fetched from the mirror (mirror.ts), made
// into pages (parse.ts) and stored. A book is never fetched again while it
// is stored, unless the rules for making pages change (PARSER_VERSION).

const RETRY_AFTER_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type GutenbergContents = { ebookId: number; entries: TocEntry[]; front: string; images: number; lang: string | null };

// One fetch per book at a time on this server, however many readers ask.
const building = new Map<number, Promise<StoredBook | null>>();

function build(ebookId: number): Promise<StoredBook | null> {
  let job = building.get(ebookId);
  if (!job) {
    job = (async () => {
      const book = parseGutenbergHtml(await fetchBookHtml(ebookId));
      if (book.pages.length === 0 && !book.front) throw new GutenbergMissing(`#${ebookId} has no text`);
      await saveBook(ebookId, book, { version: PARSER_VERSION, pinned: false });
      after(async () => {
        try {
          await pruneTexts();
        } catch (err) {
          console.error(`[gutenberg] cleanup failed: ${err instanceof Error ? err.message : err}`);
        }
      });
      return readBook(ebookId);
    })().finally(() => building.delete(ebookId));
    building.set(ebookId, job);
  }
  return job;
}

// Marked as read at most once a day, after the response has gone out.
function touch(ebookId: number, row: StoredBook) {
  if (Date.now() - row.readAt.getTime() < DAY_MS) return;
  after(async () => {
    try {
      await touchRead(ebookId);
    } catch (err) {
      console.error(`[gutenberg] marking #${ebookId} as read failed: ${err instanceof Error ? err.message : err}`);
    }
  });
}

const withBook = (html: string, bookId: string) => html.replaceAll(`/books/${BOOK_TOKEN}/`, `/books/${encodeURIComponent(bookId)}/`);

async function getContents(bookId: string, ebookId: number): Promise<Loaded<GutenbergContents>> {
  let row: StoredBook | null;
  try {
    row = await readBook(ebookId);
  } catch (err) {
    console.error(`[gutenberg] texts database unavailable: ${err instanceof Error ? err.message : err}`);
    return { ok: false, reason: "unavailable" };
  }
  let stale = false;
  if (!(row?.status === "ready" && row.version === PARSER_VERSION)) {
    if (row?.status === "failed" && Date.now() - row.fetchedAt.getTime() < RETRY_AFTER_MS) return { ok: false, reason: row.missing ? "missing" : "unavailable" };
    try {
      row = await build(ebookId);
    } catch (err) {
      // A book the mirror has no HTML for is expected (the reader offers the link).
      const log = err instanceof GutenbergMissing ? console.warn : console.error;
      log(`[gutenberg] #${ebookId} couldn't be made: ${err instanceof Error ? err.message : err}`);
      // A copy made under older rules is still worth showing.
      if (row?.status === "ready") stale = true;
      else {
        await saveFailure(ebookId, PARSER_VERSION, err instanceof GutenbergMissing).catch(() => undefined);
        return { ok: false, reason: err instanceof GutenbergMissing ? "missing" : "unavailable" };
      }
    }
  }
  if (!row?.contents) return { ok: false, reason: "unavailable" };
  touch(ebookId, row);
  const front = (await readPage(ebookId, 0)) ?? "";
  return {
    ok: true,
    stale,
    value: {
      ebookId,
      entries: row.contents.entries.map((e, i) => ({ path: String(i + 1), label: e.label, group: e.group })),
      front: withBook(front, bookId),
      images: row.contents.images,
      lang: row.contents.lang ?? null,
    },
  };
}

// Once per request, however many layouts and pages ask.
export const loadGutenbergContents = cache(getContents);

// A chapter, by its number (1..); the caller checks it is one of the book's.
export async function getGutenbergPage(bookId: string, ebookId: number, n: number): Promise<string | null> {
  const html = await readPage(ebookId, n);
  return html === null ? null : withBook(html, bookId);
}
