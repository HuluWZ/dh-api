-- CreateTable
CREATE TABLE "OrgGroupMember" (
    "groupId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "OrgGroupMember_groupId_memberId_idx" ON "OrgGroupMember"("groupId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgGroupMember_groupId_memberId_key" ON "OrgGroupMember"("groupId", "memberId");

-- AddForeignKey
ALTER TABLE "OrgGroupMember" ADD CONSTRAINT "OrgGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgGroupMember" ADD CONSTRAINT "OrgGroupMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
