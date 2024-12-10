-- AlterTable
ALTER TABLE "PrivateMessage" ADD COLUMN     "deletedByReceiver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedBySender" BOOLEAN NOT NULL DEFAULT false;
