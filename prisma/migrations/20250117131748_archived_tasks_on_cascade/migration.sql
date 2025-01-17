-- DropForeignKey
ALTER TABLE "ArchivedTasks" DROP CONSTRAINT "ArchivedTasks_taskId_fkey";

-- AddForeignKey
ALTER TABLE "ArchivedTasks" ADD CONSTRAINT "ArchivedTasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
