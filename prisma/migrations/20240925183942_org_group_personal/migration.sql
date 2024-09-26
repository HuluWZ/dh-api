-- DropForeignKey
ALTER TABLE "OrgGroup" DROP CONSTRAINT "OrgGroup_orgId_fkey";

-- AlterTable
ALTER TABLE "OrgGroup" ADD COLUMN     "createdBy" INTEGER,
ALTER COLUMN "orgId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrgGroup" ADD CONSTRAINT "OrgGroup_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgGroup" ADD CONSTRAINT "OrgGroup_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
