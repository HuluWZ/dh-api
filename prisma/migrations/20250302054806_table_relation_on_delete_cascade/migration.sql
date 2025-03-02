-- DropForeignKey
ALTER TABLE "GroupMessage" DROP CONSTRAINT "GroupMessage_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMessage" DROP CONSTRAINT "GroupMessage_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMessage" DROP CONSTRAINT "GroupMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "PinnedGroups" DROP CONSTRAINT "PinnedGroups_groupId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateMessage" DROP CONSTRAINT "PrivateMessage_forwardedFromId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateMessage" DROP CONSTRAINT "PrivateMessage_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_groupMessageId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_privateMessageId_fkey";

-- DropForeignKey
ALTER TABLE "SavedMessage" DROP CONSTRAINT "SavedMessage_groupMessageId_fkey";

-- DropForeignKey
ALTER TABLE "SavedMessage" DROP CONSTRAINT "SavedMessage_privateMessageId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAsignee" DROP CONSTRAINT "TaskAsignee_taskId_fkey";

-- AddForeignKey
ALTER TABLE "TaskAsignee" ADD CONSTRAINT "TaskAsignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_forwardedFromId_fkey" FOREIGN KEY ("forwardedFromId") REFERENCES "PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMessage" ADD CONSTRAINT "SavedMessage_privateMessageId_fkey" FOREIGN KEY ("messageId") REFERENCES "PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMessage" ADD CONSTRAINT "SavedMessage_groupMessageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_privateMessageId_fkey" FOREIGN KEY ("privateMessageId") REFERENCES "PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_groupMessageId_fkey" FOREIGN KEY ("groupMessageId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedGroups" ADD CONSTRAINT "PinnedGroups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
