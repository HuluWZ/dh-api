-- CreateTable
CREATE TABLE "OrgGroupAdmin" (
    "groupId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "OrgGroupAdmin_groupId_memberId_idx" ON "OrgGroupAdmin"("groupId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgGroupAdmin_groupId_memberId_key" ON "OrgGroupAdmin"("groupId", "memberId");

-- AddForeignKey
ALTER TABLE "OrgGroupAdmin" ADD CONSTRAINT "OrgGroupAdmin_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgGroupAdmin" ADD CONSTRAINT "OrgGroupAdmin_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
