-- CreateTable
CREATE TABLE "OrgConnecterRequest" (
    "id" SERIAL NOT NULL,
    "orgId" INTEGER NOT NULL,
    "connecterId" INTEGER NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgConnecterRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgConnecter" (
    "orgId" INTEGER NOT NULL,
    "connecterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgConnecter_orgId_connecterId_key" ON "OrgConnecter"("orgId", "connecterId");

-- AddForeignKey
ALTER TABLE "OrgConnecterRequest" ADD CONSTRAINT "OrgConnecterRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgConnecterRequest" ADD CONSTRAINT "OrgConnecterRequest_connecterId_fkey" FOREIGN KEY ("connecterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgConnecter" ADD CONSTRAINT "OrgConnecter_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgConnecter" ADD CONSTRAINT "OrgConnecter_connecterId_fkey" FOREIGN KEY ("connecterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
