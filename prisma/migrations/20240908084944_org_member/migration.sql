-- CreateEnum
CREATE TYPE "OrgMemberStatus" AS ENUM ('Member', 'Admin', 'Owner');

-- CreateTable
CREATE TABLE "OrgMember" (
    "id" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "role" "OrgMemberStatus" NOT NULL DEFAULT 'Member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgMember_orgId_memberId_idx" ON "OrgMember"("orgId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_orgId_memberId_key" ON "OrgMember"("orgId", "memberId");

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
