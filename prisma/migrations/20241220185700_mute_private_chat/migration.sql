-- CreateTable
CREATE TABLE "MutedPrivateChat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatUserId" INTEGER NOT NULL,
    "mutedUntil" TIMESTAMP(3),

    CONSTRAINT "MutedPrivateChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MutedPrivateChat_userId_chatUserId_key" ON "MutedPrivateChat"("userId", "chatUserId");

-- AddForeignKey
ALTER TABLE "MutedPrivateChat" ADD CONSTRAINT "MutedPrivateChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedPrivateChat" ADD CONSTRAINT "MutedPrivateChat_chatUserId_fkey" FOREIGN KEY ("chatUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
