-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "authorDeathYear" INTEGER;


-- Backfill authorDeathYear for the books prisma/seed.ts creates. Matched on the
-- seed's own title and author strings, and only where no year has been set, so
-- a book an admin has renamed or already filled in is left alone. The author
-- of "Copotronic Sukh Dukkho" is living, so it stays NULL.
UPDATE "Book" SET "authorDeathYear" = 1950 WHERE "title" = 'Pather Panchali' AND "author" = 'বিভূতিভূষণ বন্দ্যোপাধ্যায়' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1941 WHERE "title" = 'Shesher Kobita' AND "author" = 'রবীন্দ্রনাথ ঠাকুর' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1938 WHERE "title" = 'Devdas' AND "author" = 'শরৎচন্দ্র চট্টোপাধ্যায়' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1941 WHERE "title" = 'Sonar Tori' AND "author" = 'রবীন্দ্রনাথ ঠাকুর' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1976 WHERE "title" = 'Agnibina' AND "author" = 'কাজী নজরুল ইসলাম' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1992 WHERE "title" = 'Feluda Samagra (Prothom Khondo)' AND "author" = 'সত্যজিৎ রায়' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1930 WHERE "title" = 'The Adventures of Sherlock Holmes' AND "author" = 'Arthur Conan Doyle' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1946 WHERE "title" = 'The War of the Worlds' AND "author" = 'H. G. Wells' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1970 WHERE "title" = 'Think and Grow Rich' AND "author" = 'Napoleon Hill' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1955 WHERE "title" = 'How to Win Friends and Influence People' AND "author" = 'Dale Carnegie' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1975 WHERE "title" = 'Oshomapto Attojiboni' AND "author" = 'শেখ মুজিবুর রহমান' AND "authorDeathYear" IS NULL;
UPDATE "Book" SET "authorDeathYear" = 1975 WHERE "title" = 'Karagarer Rojnamcha' AND "author" = 'শেখ মুজিবুর রহমান' AND "authorDeathYear" IS NULL;

-- Two books were wrongly marked public domain. Bangladeshi copyright runs 60
-- years after the end of the year the author died, so in 2026 only authors who
-- died in 1965 or earlier qualify: Kazi Nazrul Islam died in 1976, Napoleon
-- Hill in 1970. A book that already has a PDF attached is skipped -- the PDF
-- must be removed first, and /admin/books flags the book until it is.
UPDATE "Book" AS b SET "isPublicDomain" = false
WHERE b."title" = 'Agnibina' AND b."author" = 'কাজী নজরুল ইসলাম'
  AND NOT EXISTS (SELECT 1 FROM "BookFile" AS f WHERE f."bookId" = b."id");
UPDATE "Book" AS b SET "isPublicDomain" = false
WHERE b."title" = 'Think and Grow Rich' AND b."author" = 'Napoleon Hill'
  AND NOT EXISTS (SELECT 1 FROM "BookFile" AS f WHERE f."bookId" = b."id");
