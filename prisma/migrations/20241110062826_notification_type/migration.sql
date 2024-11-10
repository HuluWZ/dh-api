-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Task', 'Communication', 'System', 'Others');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'Task';
