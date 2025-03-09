-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "forwardedFromPrivateId" INTEGER;

-- AlterTable
ALTER TABLE "PrivateMessage" ADD COLUMN     "forwardedFromGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_forwardedFromGroupId_fkey" FOREIGN KEY ("forwardedFromGroupId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_forwardedFromPrivateId_fkey" FOREIGN KEY ("forwardedFromPrivateId") REFERENCES "PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
