-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_groupId_fkey";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
