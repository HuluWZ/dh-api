-- CreateTable
CREATE TABLE "UserAdmin" (
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAdmin_userId_key" ON "UserAdmin"("userId");

-- AddForeignKey
ALTER TABLE "UserAdmin" ADD CONSTRAINT "UserAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
