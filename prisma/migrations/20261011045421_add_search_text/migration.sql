-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "searchText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "BookRequest" ADD COLUMN     "searchText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "searchText" TEXT NOT NULL DEFAULT '';

-- Backfill existing rows. This function mirrors normalizeForSearch() in
-- src/lib/search.ts step for step:
--   NFC; khanda ta written as U+09A4 U+09CD + ZWJ becomes U+09CE; zero-width
--   characters (U+200B-U+200D, U+2060, U+FEFF) removed; NFC again; lowercase
--   with the ICU root collation (the same mapping as JavaScript's
--   toLowerCase -- the database default, C.UTF-8, differs for a few letters);
--   runs of the same whitespace set collapsed to one space; trimmed.
-- An empty result is NULL here so concat_ws skips it, as the helper skips
-- empty fields. Fields are joined with a newline, as in the helper.
CREATE FUNCTION "boimohol_search_norm_tmp"(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT NULLIF(btrim(
    regexp_replace(
      lower(
        normalize(
          regexp_replace(
            replace(normalize(coalesce(t, ''), NFC), U&'\09A4\09CD\200D', U&'\09CE'),
            U&'[\200B-\200D\2060\FEFF]', '', 'g'),
          NFC
        ) COLLATE "und-x-icu"
      ),
      U&'[\0009\000A\000B\000C\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000]+', ' ', 'g'),
    ' '), '')
$$;

UPDATE "Book" SET "searchText" = concat_ws(E'\n',
  "boimohol_search_norm_tmp"("title"),
  "boimohol_search_norm_tmp"("titleBangla"),
  "boimohol_search_norm_tmp"("author"));

UPDATE "Listing" SET "searchText" = concat_ws(E'\n',
  "boimohol_search_norm_tmp"("title"),
  "boimohol_search_norm_tmp"("author"),
  "boimohol_search_norm_tmp"("location"));

UPDATE "BookRequest" SET "searchText" = concat_ws(E'\n',
  "boimohol_search_norm_tmp"("title"),
  "boimohol_search_norm_tmp"("author"));

DROP FUNCTION "boimohol_search_norm_tmp"(text);
