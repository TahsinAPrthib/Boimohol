-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('WIKISOURCE', 'GUTENBERG', 'INTERNET_ARCHIVE');

-- CreateTable
CREATE TABLE "BookSource" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "kind" "SourceKind" NOT NULL,
    "url" TEXT NOT NULL,
    "rightsBasis" TEXT NOT NULL,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookSource_bookId_idx" ON "BookSource"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookSource_bookId_url_key" ON "BookSource"("bookId", "url");

-- AddForeignKey
ALTER TABLE "BookSource" ADD CONSTRAINT "BookSource_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSource" ADD CONSTRAINT "BookSource_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

