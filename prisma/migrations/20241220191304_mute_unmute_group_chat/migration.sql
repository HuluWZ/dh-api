-- CreateTable
CREATE TABLE "MutedGroupChat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "mutedUntil" TIMESTAMP(3),

    CONSTRAINT "MutedGroupChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MutedGroupChat_userId_groupId_key" ON "MutedGroupChat"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "MutedGroupChat" ADD CONSTRAINT "MutedGroupChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedGroupChat" ADD CONSTRAINT "MutedGroupChat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
