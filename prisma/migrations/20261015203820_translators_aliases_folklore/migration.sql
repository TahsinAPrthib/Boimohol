-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "searchAliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "translator" TEXT;


-- A category for the Wikisource and Gutenberg import (data only). An existing
-- slug is left as it is, so this is safe to re-run.
INSERT INTO "Category" ("id", "slug", "name", "nameBangla", "description", "colorKey") VALUES
  ('cat-puran-lokkotha', 'puran-lokkotha', 'Mythology & Folklore', 'পুরাণ ও লোককথা', 'পুরাণ ও মহাকাব্যের কাহিনি, উপকথা, রূপকথা আর লোককথা।', 'oxblood')
ON CONFLICT ("slug") DO NOTHING;
