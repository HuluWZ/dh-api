-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "privateMessageId" INTEGER,
    "groupMessageId" INTEGER,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_private_message_reaction" ON "Reaction"("userId", "privateMessageId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "unique_group_message_reaction" ON "Reaction"("userId", "groupMessageId", "type");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_privateMessageId_fkey" FOREIGN KEY ("privateMessageId") REFERENCES "PrivateMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_groupMessageId_fkey" FOREIGN KEY ("groupMessageId") REFERENCES "GroupMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
