-- CreateTable
CREATE TABLE "PinnedGroups" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PinnedGroups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PinnedGroups_userId_groupId_key" ON "PinnedGroups"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "PinnedGroups" ADD CONSTRAINT "PinnedGroups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedGroups" ADD CONSTRAINT "PinnedGroups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
