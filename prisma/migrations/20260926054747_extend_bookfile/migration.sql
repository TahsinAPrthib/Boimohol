/*
  Warnings:

  - Added the required column `fileSizeBytes` to the `BookFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `BookFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rightsBasis` to the `BookFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BookFile" DROP CONSTRAINT "BookFile_bookId_fkey";

-- AlterTable
ALTER TABLE "BookFile" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fileSizeBytes" INTEGER NOT NULL,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "rightsBasis" TEXT NOT NULL,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "uploadedById" TEXT,
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "BookFile_uploadedById_idx" ON "BookFile"("uploadedById");

-- AddForeignKey
ALTER TABLE "BookFile" ADD CONSTRAINT "BookFile_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookFile" ADD CONSTRAINT "BookFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
