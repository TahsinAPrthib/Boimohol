-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "pacingRating" INTEGER,
ADD COLUMN     "plotRating" INTEGER,
ADD COLUMN     "writingRating" INTEGER;

-- AlterTable
ALTER TABLE "ShelfItem" ADD COLUMN     "finishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "yearlyGoal" INTEGER;

-- CreateTable
CREATE TABLE "ReadingActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadingActivity_userId_date_key" ON "ReadingActivity"("userId", "date");

-- AddForeignKey
ALTER TABLE "ReadingActivity" ADD CONSTRAINT "ReadingActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- One-time backfill: approximate finishedAt for pre-existing FINISHED shelf
-- items using their last updatedAt, since we have no better historical data.
-- This is NOT meant to run again on future migrations.
UPDATE "ShelfItem" SET "finishedAt" = "updatedAt" WHERE "status" = 'FINISHED' AND "finishedAt" IS NULL;
