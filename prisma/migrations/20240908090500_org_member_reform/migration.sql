/*
  Warnings:

  - The primary key for the `OrgMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OrgMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrgMember" DROP CONSTRAINT "OrgMember_pkey",
DROP COLUMN "id";
