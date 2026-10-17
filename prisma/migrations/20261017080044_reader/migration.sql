-- CreateTable
CREATE TABLE "ReadingPosition" (
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingPosition_pkey" PRIMARY KEY ("userId","bookId")
);

-- CreateTable
CREATE TABLE "ReaderCache" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderCache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "ReadingPosition_bookId_idx" ON "ReadingPosition"("bookId");

-- CreateIndex
CREATE INDEX "ReaderCache_fetchedAt_idx" ON "ReaderCache"("fetchedAt");

-- AddForeignKey
ALTER TABLE "ReadingPosition" ADD CONSTRAINT "ReadingPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingPosition" ADD CONSTRAINT "ReadingPosition_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

