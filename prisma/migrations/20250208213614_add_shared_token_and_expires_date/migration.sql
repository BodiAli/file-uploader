-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "shareExpires" TIMESTAMP(3),
ADD COLUMN     "shareToken" TEXT;
