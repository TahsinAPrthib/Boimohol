-- DropIndex
DROP INDEX "ReaderCache_fetchedAt_idx";

-- AlterTable
ALTER TABLE "ReaderCache" ADD COLUMN     "bytes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ReaderCache_readAt_idx" ON "ReaderCache"("readAt");


-- Existing rows: their size, and "last read" as when they were fetched.
UPDATE "ReaderCache" SET "bytes" = octet_length("data"::text), "readAt" = "fetchedAt";
