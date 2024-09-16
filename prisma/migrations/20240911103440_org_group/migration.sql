-- CreateTable
CREATE TABLE "OrgGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrgGroup" ADD CONSTRAINT "OrgGroup_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
