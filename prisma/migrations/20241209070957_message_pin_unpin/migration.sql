-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PrivateMessage" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false;
