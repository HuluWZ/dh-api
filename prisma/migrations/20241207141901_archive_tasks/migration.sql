-- CreateTable
CREATE TABLE "ArchivedTasks" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchivedTasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchivedTasks_userId_taskId_idx" ON "ArchivedTasks"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivedTasks_userId_taskId_key" ON "ArchivedTasks"("userId", "taskId");

-- AddForeignKey
ALTER TABLE "ArchivedTasks" ADD CONSTRAINT "ArchivedTasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedTasks" ADD CONSTRAINT "ArchivedTasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
