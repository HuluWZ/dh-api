-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "pinnedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PrivateMessage" ADD COLUMN     "pinnedAt" TIMESTAMP(3);
