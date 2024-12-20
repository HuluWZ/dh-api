import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGroupMessageDto,
  CreatePrivateMessageDto,
  CreateReactionDto,
  CreateSavedMessageDto,
  ForwardGroupMessageDto,
  ForwardPrivateMessageDto,
  GroupInclude,
  MuteGroupChatDto,
  MutePrivateChatDto,
  PrivateInclude,
} from './dto/private.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrivateChatService {
  constructor(private prisma: PrismaService) {}

  async createPrivateMessage(
    senderId: number,
    createPrivateMessageDto: CreatePrivateMessageDto,
  ) {
    return this.prisma.privateMessage.create({
      data: {
        ...createPrivateMessageDto,
        senderId,
      },
      include: PrivateInclude,
    });
  }

  async findMessages(senderId: number, receiverId: number) {
    return this.prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      include: PrivateInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getMyChats(userId: number) {
    const latestMessages = await this.prisma.privateMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        replies: true,
        senderId: true,
        receiverId: true,
        createdAt: true,
        Reaction: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            userName: true,
            profile: true,
            phone: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            userName: true,
            profile: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Sort by the latest message timestamp
      },
    });

    // Use a Set to track the unique users, starting with the most recent ones
    const uniqueUsers = new Map<
      number,
      {
        id: number;
        firstName: string;
        middleName: string;
        userName: string;
        phone: string;
        profile: string;
        createdAt: string;
      }
    >();

    latestMessages.forEach((message) => {
      if (message.senderId !== userId && !uniqueUsers.has(message.senderId)) {
        uniqueUsers.set(message.senderId, {
          id: message.sender.id,
          firstName: message.sender.firstName,
          middleName: message.sender.middleName,
          userName: message.sender.userName,
          profile: message.sender.profile,
          phone: message.sender.phone,
          createdAt: message.createdAt.toDateString(),
        });
      } else if (
        message.receiverId !== userId &&
        !uniqueUsers.has(message.receiverId)
      ) {
        uniqueUsers.set(message.receiverId, {
          id: message.receiver.id,
          firstName: message.receiver.firstName,
          middleName: message.receiver.middleName,
          userName: message.receiver.userName,
          profile: message.receiver.profile,
          phone: message.receiver.phone,
          createdAt: message.createdAt.toDateString(),
        });
      }
    });

    return Array.from(uniqueUsers.values()); // Return the sorted unique users wit
  }
  async getMessage(id: number) {
    return this.prisma.privateMessage.findUnique({
      where: { id },
      include: { replies: true, Reaction: true },
    });
  }
  async deleteMessage(id: number) {
    return this.prisma.privateMessage.delete({ where: { id } });
  }
  async deleteMultipleMessage(ids: number[]) {
    return this.prisma.privateMessage.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async updateMessageSeen(id: number) {
    return this.prisma.privateMessage.update({
      where: { id },
      data: { is_seen: true },
    });
  }
  async createGroupMessage(
    senderId: number,
    createGroupMessage: CreateGroupMessageDto,
  ) {
    return this.prisma.groupMessage.create({
      data: {
        ...createGroupMessage,
        senderId,
      },
      include: GroupInclude,
    });
  }
  async getGroupMessage(id: number) {
    return this.prisma.groupMessage.findUnique({
      where: { id },
      include: GroupInclude,
    });
  }
  async deleteGroupMessage(id: number) {
    return this.prisma.groupMessage.update({
      where: { id },
      data: { is_archived: true },
    });
  }
  async deleteMultipleGroupMessage(ids: number[]) {
    return this.prisma.groupMessage.updateMany({
      where: { id: { in: ids } },
      data: { is_archived: true },
    });
  }

  async updateGroupMessageSeen(id: number) {
    return this.prisma.groupMessage.update({
      where: { id },
      data: { is_seen: true },
      include: GroupInclude,
    });
  }
  async updateGroupMessageIsPinned(id: number, is_pinned: boolean) {
    return this.prisma.groupMessage.update({
      where: { id },
      data: { is_pinned },
      include: GroupInclude,
    });
  }
  async updatePrivateMessageIsPinned(id: number, is_pinned: boolean) {
    return this.prisma.privateMessage.update({
      where: { id },
      data: { is_pinned },
      include: PrivateInclude,
    });
  }

  async getGroupMessageByGroupId(groupId: number) {
    return this.prisma.groupMessage.findMany({
      where: { groupId, is_archived: false },
      include: GroupInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async searchMessagesByContent(
    userId: number,
    content: string,
    type: 'private' | 'group' | 'all',
  ) {
    if (!content) {
      throw new Error('Content parameter is required for searching messages.');
    }

    const privateFilters: Prisma.PrivateMessageWhereInput = {
      AND: [
        { content: { contains: content, mode: 'insensitive' } },
        { OR: [{ senderId: userId }, { receiverId: userId }] },
      ],
    };

    const groupFilters: Prisma.GroupMessageWhereInput = {
      AND: [
        { content: { contains: content, mode: 'insensitive' } },
        { is_archived: false },
        {
          OR: [
            { senderId: userId },
            {
              group: {
                OR: [
                  { createdBy: userId },
                  {
                    OrgGroupMember: {
                      some: { memberId: userId },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    if (type === 'private') {
      return this.prisma.privateMessage.findMany({ where: privateFilters });
    } else if (type === 'group') {
      return this.prisma.groupMessage.findMany({ where: groupFilters });
    } else {
      const [privateMessages, groupMessages] = await Promise.all([
        this.prisma.privateMessage.findMany({ where: privateFilters }),
        this.prisma.groupMessage.findMany({ where: groupFilters }),
      ]);

      return { privateMessages, groupMessages };
    }
  }
  async saveMessage(
    userId: number,
    createSavedMessageDto: CreateSavedMessageDto,
  ) {
    return this.prisma.savedMessage.create({
      data: {
        ...createSavedMessageDto,
        userId,
      },
    });
  }
  async removeSavedMessage(userId: number, id: number) {
    return this.prisma.savedMessage.delete({ where: { id, userId } });
  }
  async getSavedMessages(userId: number) {
    return this.prisma.savedMessage.findMany({
      where: { userId },
      include: { groupMessage: true, privateMessage: true },
      orderBy: { savedAt: 'desc' },
    });
  }
  async getMultiplePrivateMessages(ids: number[]) {
    return this.prisma.privateMessage.findMany({ where: { id: { in: ids } } });
  }
  async updatePrivateMessageDelete(
    id: number,
    deletedBySender: boolean,
    deletedByReceiver: boolean,
  ) {
    return this.prisma.privateMessage.update({
      where: { id },
      data: { deletedByReceiver, deletedBySender },
    });
  }
  async createReactions(userId: number, createReaction: CreateReactionDto) {
    const { messageType, ...reactionDate } = createReaction;
    const createReactionRecord = async (data) => {
      return this.prisma.reaction.create({
        data: {
          ...data,
          userId,
        },
      });
    };

    if (messageType === 'GroupMessage') {
      const message = await this.prisma.groupMessage.findUnique({
        where: { id: reactionDate.messageId },
      });
      if (!message) {
        throw new NotFoundException('Message not found');
      }
      return createReactionRecord(reactionDate);
    }

    if (messageType === 'PrivateMessage') {
      const message = await this.prisma.groupMessage.findUnique({
        where: { id: reactionDate.messageId },
      });
      if (!message) {
        throw new NotFoundException('Message not found');
      }
      return createReactionRecord(reactionDate);
    }
  }
  async getReaction(id: number) {
    return this.prisma.reaction.findUnique({ where: { id } });
  }
  async removeReaction(userId: number, reactionId: number) {
    const reaction = await this.getReaction(reactionId);
    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
    if (reaction.userId !== userId) {
      throw new Error('You are not authorized to remove this reaction');
    }
    return this.prisma.reaction.delete({ where: { id: reaction.id } });
  }
  async forwardPrivateMessage(
    senderId: number,
    { messageId, receiverId }: ForwardPrivateMessageDto,
  ) {
    const originalMessage = await this.prisma.privateMessage.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    return this.prisma.privateMessage.create({
      data: {
        senderId,
        receiverId,
        content: originalMessage.content,
        type: originalMessage.type,
        forwardedFromId: messageId,
      },
    });
  }
  async forwardGroupMessage(
    senderId: number,
    { messageId, groupId }: ForwardGroupMessageDto,
  ) {
    const originalMessage = await this.prisma.groupMessage.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    return this.prisma.groupMessage.create({
      data: {
        senderId,
        groupId,
        content: originalMessage.content,
        type: originalMessage.type,
        forwardedFromId: messageId,
      },
    });
  }
  async mutePrivateChat(userId: number, mutePrivate: MutePrivateChatDto) {
    return this.prisma.mutedPrivateChat.upsert({
      where: {
        userId_chatUserId: { userId, chatUserId: mutePrivate.chatUserId },
      },
      update: { mutedUntil: mutePrivate.mutedUntil },
      create: {
        userId,
        ...mutePrivate,
      },
    });
  }
  async unmutePrivateChat(userId: number, chatUserId: number) {
    return this.prisma.mutedPrivateChat.deleteMany({
      where: { userId, chatUserId },
    });
  }
  async muteGroupChat(userId: number, mutedGroupChat: MuteGroupChatDto) {
    return this.prisma.mutedGroupChat.upsert({
      where: {
        userId_groupId: { userId, groupId: mutedGroupChat.groupId },
      },
      update: { mutedUntil: mutedGroupChat.mutedUntil },
      create: {
        userId,
        ...mutedGroupChat,
      },
    });
  }
  async unmuteGroupChat(userId: number, groupId: number) {
    return this.prisma.mutedGroupChat.deleteMany({
      where: { userId, groupId },
    });
  }
}
