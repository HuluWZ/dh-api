/*
  Warnings:

  - You are about to drop the column `org_id` on the `Catalog` table. All the data in the column will be lost.
  - Added the required column `orgId` to the `Catalog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Catalog" DROP COLUMN "org_id",
ADD COLUMN     "orgId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
