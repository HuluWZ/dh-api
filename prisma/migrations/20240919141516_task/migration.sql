-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('Urgent', 'High', 'Medium', 'Low', 'NoPriority');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Backlog', 'Todo', 'InProgress', 'AwaitingReview', 'InReview', 'Done');

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "deadline" TIMESTAMP(3),
    "priority" "TaskPriority" DEFAULT 'NoPriority',
    "status" "TaskStatus" DEFAULT 'Todo',
    "groupId" INTEGER NOT NULL,
    "monitoredBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAsignee" (
    "taskId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "TaskAsignee_taskId_memberId_idx" ON "TaskAsignee"("taskId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAsignee_taskId_memberId_key" ON "TaskAsignee"("taskId", "memberId");

-- AddForeignKey
ALTER TABLE "TaskAsignee" ADD CONSTRAINT "TaskAsignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAsignee" ADD CONSTRAINT "TaskAsignee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
