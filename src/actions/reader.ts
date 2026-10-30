"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { logReadingActivity } from "@/lib/streak";
import { readerSource } from "@/lib/reader/source";
import { isValidTitle } from "@/lib/wikisource/titles";

const positionSchema = z.object({
  bookId: z.string().min(1).max(200),
  chapter: z.string().max(255).refine((c) => c === "" || isValidTitle(c)),
  progress: z.number().finite().min(0).max(1),
});

// Where a signed-in reader is in a book's in-site reader. Called by the
// reader page itself (ReaderProgress): once a few seconds after a page
// opens, then now and then as they scroll. Reading counts toward the
// reading streak, like marking a book on the shelf does.
export async function saveReadingPosition(bookId: string, chapter: string, progress: number): Promise<{ ok: boolean }> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false };
  const parsed = positionSchema.safeParse({ bookId, chapter, progress });
  if (!parsed.success) return { ok: false };

  const book = await prisma.book.findUnique({
    where: { id: parsed.data.bookId },
    select: { isPublicDomain: true, authorDeathYear: true, sources: { select: { kind: true, url: true } } },
  });
  if (!book || !readerSource(book)) return { ok: false };

  const data = { chapter: parsed.data.chapter, progress: parsed.data.progress };
  await prisma.readingPosition.upsert({
    where: { userId_bookId: { userId, bookId: parsed.data.bookId } },
    update: data,
    create: { userId, bookId: parsed.data.bookId, ...data },
  });
  await logReadingActivity(userId);
  return { ok: true };
}
