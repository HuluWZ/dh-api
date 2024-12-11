/*
  Warnings:

  - You are about to drop the column `ownerId` on the `OwnershipTransfer` table. All the data in the column will be lost.
  - Added the required column `requestedBy` to the `OwnershipTransfer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- DropForeignKey
ALTER TABLE "OwnershipTransfer" DROP CONSTRAINT "OwnershipTransfer_ownerId_fkey";

-- AlterTable
ALTER TABLE "OwnershipTransfer" DROP COLUMN "ownerId",
ADD COLUMN     "requestedBy" INTEGER NOT NULL,
ADD COLUMN     "status" "TransferStatus" NOT NULL DEFAULT 'Pending';

-- AddForeignKey
ALTER TABLE "OwnershipTransfer" ADD CONSTRAINT "OwnershipTransfer_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
