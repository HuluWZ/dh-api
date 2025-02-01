/*
  Warnings:

  - A unique constraint covering the columns `[orgId,connecterId]` on the table `OrgConnecter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrgConnecter_orgId_connecterId_key" ON "OrgConnecter"("orgId", "connecterId");
