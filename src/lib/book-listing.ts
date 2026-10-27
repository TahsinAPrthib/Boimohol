import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { banglaFirst, splitPage } from "@/lib/book-language";

// The order of the library and the category pages: the curated books first
// (Bangla first, by the title readers see), then the books imported in bulk
// from a whole catalog, by title (Book.sortTitle: leading quote marks and
// symbols, case and accents don't count). Only one page of the bulk books is
// ever read: the database sorts and pages them (the curated + sortTitle
// indexes), so a page stays quick with tens of thousands of books.
export async function curatedFirstPage(where: Prisma.BookWhereInput, page: number): Promise<{ ids: string[]; page: number; pages: number }> {
  const curatedWhere = { AND: [where, { curated: true }] };
  const restWhere = { AND: [where, { curated: false }] };
  const [curated, restCount] = await Promise.all([
    prisma.book.findMany({ where: curatedWhere, select: { id: true, title: true, titleBangla: true, language: true } }),
    prisma.book.count({ where: restWhere }),
  ]);
  const ordered = banglaFirst(curated).map((b) => b.id);
  const slice = splitPage(ordered.length, restCount, page);
  const rest =
    slice.rest.take > 0
      ? await prisma.book.findMany({
          where: restWhere,
          orderBy: [{ sortTitle: "asc" }, { id: "asc" }],
          skip: slice.rest.skip,
          take: slice.rest.take,
          select: { id: true },
        })
      : [];
  return { ids: [...ordered.slice(...slice.curated), ...rest.map((b) => b.id)], page: slice.page, pages: slice.pages };
}
