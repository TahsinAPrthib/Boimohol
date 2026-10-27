-- The books imported in bulk are listed by a sort key rather than the raw
-- title, so titles starting with quote marks or symbols ("“1914”", "!Tention")
-- don't all come first. The listing indexes move to the key.

-- DropIndex
DROP INDEX "Book_categoryId_curated_title_idx";

-- DropIndex
DROP INDEX "Book_curated_title_idx";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "sortTitle" TEXT NOT NULL DEFAULT '';

-- Backfill, mirroring bookSortTitle() in src/lib/book-language.ts step for
-- step: accents removed (NFD, combining marks U+0300-U+036F dropped, NFC);
-- leading characters that are neither letters nor digits removed; trimmed;
-- lowercased. Letters, digits and lowercasing follow the ICU root collation,
-- as JavaScript does (the database default, C.UTF-8, knows no Bangla letters).
UPDATE "Book" SET "sortTitle" = lower(
  btrim(
    regexp_replace(
      normalize(regexp_replace(normalize("title", NFD), U&'[\0300-\036F]', '', 'g'), NFC) COLLATE "und-x-icu",
      '^[^[:alpha:][:digit:]]+', ''
    )
  ) COLLATE "und-x-icu"
);

-- CreateIndex
CREATE INDEX "Book_curated_sortTitle_idx" ON "Book"("curated", "sortTitle");

-- CreateIndex
CREATE INDEX "Book_categoryId_curated_sortTitle_idx" ON "Book"("categoryId", "curated", "sortTitle");
