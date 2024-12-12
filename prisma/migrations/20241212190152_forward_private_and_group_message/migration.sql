-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "forwardedFromId" INTEGER;

-- AlterTable
ALTER TABLE "PrivateMessage" ADD COLUMN     "forwardedFromId" INTEGER;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_forwardedFromId_fkey" FOREIGN KEY ("forwardedFromId") REFERENCES "PrivateMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_forwardedFromId_fkey" FOREIGN KEY ("forwardedFromId") REFERENCES "GroupMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
