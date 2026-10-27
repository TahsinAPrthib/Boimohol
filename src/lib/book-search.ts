import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { escapeLike, normalizeForSearch } from "@/lib/search";
import type { LanguageFilter } from "@/lib/book-language";

// Site search over every book, curated or not, ranked in the database so only
// the books shown are read, however many match. The ranking is matchRank's
// (src/lib/search.ts), on the lines of the search text -- title, Bangla title,
// author, translator, hidden aliases -- which bookSearchText joins with
// newlines: 0 when a line is the query, 1 when one starts with it, 2 when a
// word in one does, 3 for a match anywhere. Among equals, Bangla books first,
// then curated ones, then by title (Book.sortTitle). The filter is a LIKE on the search text,
// which the trigram index serves.
export async function searchBookIds(query: string, lang: LanguageFilter, limit: number): Promise<{ ids: string[]; more: boolean }> {
  const q = normalizeForSearch(query);
  if (!q) return { ids: [], more: false };
  const language =
    lang === "bn" ? Prisma.sql`AND "language" = 'bn'` : lang === "other" ? Prisma.sql`AND "language" <> 'bn'` : Prisma.empty;
  // position() matches the query literally, so only the LIKE needs escaping.
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Book"
    WHERE "searchText" LIKE ${`%${escapeLike(q)}%`} ${language}
    ORDER BY
      CASE
        WHEN position(${`\n${q}\n`} IN E'\\n' || "searchText" || E'\\n') > 0 THEN 0
        WHEN position(${`\n${q}`} IN E'\\n' || "searchText") > 0 THEN 1
        WHEN position(${` ${q}`} IN "searchText") > 0 THEN 2
        ELSE 3
      END,
      ("language" <> 'bn'),
      "curated" DESC,
      "sortTitle",
      "id"
    LIMIT ${limit + 1}`;
  return { ids: rows.slice(0, limit).map((r) => r.id), more: rows.length > limit };
}
