-- DropForeignKey
ALTER TABLE "Org" DROP CONSTRAINT "Org_regionId_fkey";

-- AlterTable
ALTER TABLE "Org" ALTER COLUMN "regionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
