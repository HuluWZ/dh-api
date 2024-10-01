-- CreateTable
CREATE TABLE "FCM" (
    "userId" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "FCM_userId_deviceId_idx" ON "FCM"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "FCM_userId_deviceId_key" ON "FCM"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "FCM" ADD CONSTRAINT "FCM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
