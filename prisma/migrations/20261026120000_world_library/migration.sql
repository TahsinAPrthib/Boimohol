-- The whole Project Gutenberg catalog as a bulk, uncurated import: a flag for
-- the books chosen by hand (every book so far), indexes for listing those
-- first, a trigram index so site search scales to tens of thousands of books,
-- and a category for books that fit no other.

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "curated" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Book_curated_title_idx" ON "Book"("curated", "title");

-- CreateIndex
CREATE INDEX "Book_categoryId_curated_title_idx" ON "Book"("categoryId", "curated", "title");

-- Trigrams for LIKE '%...%' on the normalized search text (available on Neon).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Book_searchText_idx" ON "Book" USING GIN ("searchText" gin_trgm_ops);

-- A category for books that fit no other (data only). An existing slug is
-- left as it is, as in 20261015085903.
INSERT INTO "Category" ("id", "slug", "name", "nameBangla", "description", "colorKey") VALUES
  ('cat-onnanno', 'onnanno', 'Other', 'অন্যান্য', 'রান্না, চিকিৎসা, আইন, সংগীত, শিক্ষা আর নানা বিষয়ের বই, যেগুলো আর কোনো বিভাগে পড়ে না।', 'cloth')
ON CONFLICT ("slug") DO NOTHING;
