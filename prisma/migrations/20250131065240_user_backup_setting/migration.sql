-- CreateEnum
CREATE TYPE "BackupSchedule" AS ENUM ('Daily', 'Weekly', 'Monthly');

-- CreateTable
CREATE TABLE "UserBackupSetting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "auto_backup" BOOLEAN NOT NULL DEFAULT false,
    "including_video" BOOLEAN NOT NULL DEFAULT false,
    "cellular_backup" BOOLEAN NOT NULL DEFAULT false,
    "backup_schedule" "BackupSchedule" NOT NULL,
    "backup_time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBackupSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBackupSetting" ADD CONSTRAINT "UserBackupSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
