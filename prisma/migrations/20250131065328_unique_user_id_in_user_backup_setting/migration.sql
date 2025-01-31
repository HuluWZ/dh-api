/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserBackupSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserBackupSetting_userId_key" ON "UserBackupSetting"("userId");
