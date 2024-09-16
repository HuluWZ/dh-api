/*
  Warnings:

  - You are about to drop the column `userId` on the `Org` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Org" DROP CONSTRAINT "Org_userId_fkey";

-- AlterTable
ALTER TABLE "Org" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
