import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChatType,
  CreateGroupMessageDto,
  CreatePrivateMessageDto,
  CreateReactionDto,
  CreateSavedMessageDto,
  ForwardGroupMessageDto,
  ForwardPrivateMessageDto,
  GroupInclude,
  MessageType,
  MuteGroupChatDto,
  MutePrivateChatDto,
  PrivateInclude,
} from './dto/private.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/dto/notification.dto';
interface Conversation {
  _max: { createdAt: Date };
  senderId: number;
  receiverId: number;
}

@Injectable()
export class PrivateChatService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getMyRecentConversations(userId: number) {
    const uniqueConversations = await this.prisma.privateMessage.groupBy({
      by: ['senderId', 'receiverId'],
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      _max: {
        createdAt: true,
      },
    });
    const conversationMap = new Map<string, Conversation>();

    uniqueConversations.forEach((conversation) => {
      const key1 = `${conversation.senderId}-${conversation.receiverId}`;
      const key2 = `${conversation.receiverId}-${conversation.senderId}`;

      if (conversationMap.has(key1)) {
        const existingConversation = conversationMap.get(key1)!;
        if (conversation._max.createdAt > existingConversation._max.createdAt) {
          conversationMap.set(key1, conversation);
        }
      } else if (conversationMap.has(key2)) {
        const existingConversation = conversationMap.get(key2)!;
        if (conversation._max.createdAt > existingConversation._max.createdAt) {
          conversationMap.set(key2, conversation);
        }
      } else {
        conversationMap.set(key1, conversation);
      }
    });

    const filteredConversations = Array.from(conversationMap.values());
    const privateMessages = await Promise.all(
      filteredConversations.map(async (group) => {
        const { senderId, receiverId, _max } = group;
        const latestMessage = await this.prisma.privateMessage.findFirst({
          where: {
            senderId,
            receiverId,
            createdAt: _max.createdAt,
          },
          include: PrivateInclude,
        });
        return latestMessage;
      }),
    );
    const groupMessages = await this.prisma.groupMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { group: { OrgGroupMember: { some: { memberId: userId } } } },
        ],
      },
      include: GroupInclude,
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['groupId'],
    });
    const allMessages = [...privateMessages, ...groupMessages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return allMessages;
  }
  async createPrivateMessage(
    senderId: number,
    createPrivateMessageDto: CreatePrivateMessageDto,
  ) {
    //  check if the message type is Image or File, then the caption is required
    if (
      createPrivateMessageDto.type !== MessageType.Image &&
      createPrivateMessageDto.type !== MessageType.File &&
      createPrivateMessageDto.caption
    ) {
      throw new BadRequestException(
        `Image caption is only required for type Image and File`,
      );
    }

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
    groupId?: number,
    receiverId?: number,
  ) {
    if (receiverId) {
      return this.prisma.privateMessage.findMany({
        where: {
          AND: [
            {
              OR: [
                { senderId: receiverId, receiverId: userId },
                { senderId: userId, receiverId: receiverId },
              ],
            },
            { content: { contains: content, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (groupId) {
      return this.prisma.groupMessage.findMany({
        where: {
          AND: [
            { groupId },
            { content: { contains: content, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
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
  async getReactionByMessageId(
    userId: number,
    type: string,
    privateMessageId?: number,
    groupMessageId?: number,
  ) {
    if (privateMessageId) {
      return this.prisma.reaction.findFirst({
        where: {
          type,
          privateMessageId,
          userId,
        },
      });
    }
    if (groupMessageId) {
      return this.prisma.reaction.findFirst({
        where: {
          type,
          groupMessageId,
          userId,
        },
      });
    }
  }
  async createReactions(userId: number, createReaction: CreateReactionDto) {
    const { messageType, messageId, type } = createReaction;
    if (['PrivateMessage', 'GroupMessage'].indexOf(messageType) === -1) {
      throw new BadRequestException('Invalid message type');
    }
    if (messageType === 'GroupMessage') {
      const message = await this.prisma.groupMessage.findUnique({
        where: { id: messageId },
      });
      if (!message) {
        throw new NotFoundException('Group Message not found');
      }
      return this.prisma.reaction.create({
        data: {
          type,
          groupMessageId: messageId,
          userId,
        },
        include: {
          groupMessage: { include: GroupInclude },
          user: true,
          privateMessage: { include: PrivateInclude },
        },
      });
    }

    if (messageType === 'PrivateMessage') {
      const message = await this.prisma.privateMessage.findUnique({
        where: { id: messageId },
      });
      if (!message) {
        throw new NotFoundException('Private Message not found');
      }
      return this.prisma.reaction.create({
        data: {
          type,
          privateMessageId: messageId,
          userId,
        },
        include: {
          groupMessage: { include: GroupInclude },
          user: true,
          privateMessage: { include: PrivateInclude },
        },
      });
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
    return this.prisma.reaction.delete({
      where: { id: reaction.id },
      include: {
        groupMessage: { include: GroupInclude },
        privateMessage: { include: PrivateInclude },
      },
    });
  }
  async forwardToPrivateMessage(
    senderId: number,
    { messageType, messageId, receiverId }: ForwardPrivateMessageDto,
  ) {
    const isPrivateMessage = messageType == ChatType.PrivateMessage;
    const originalMessage = isPrivateMessage
      ? await this.prisma.privateMessage.findUnique({
          where: { id: messageId },
        })
      : await this.prisma.groupMessage.findUnique({ where: { id: messageId } });
    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }
    return this.prisma.privateMessage.create({
      data: {
        senderId,
        receiverId,
        content: originalMessage.content,
        type: originalMessage.type,
        caption: originalMessage.caption,
        forwardedFromId: isPrivateMessage ? messageId : null,
        forwardedFromGroupId: isPrivateMessage ? null : messageId,
      },
      include: PrivateInclude,
    });
  }
  async forwardToGroupMessage(
    senderId: number,
    { messageId, groupId, messageType }: ForwardGroupMessageDto,
  ) {
    const isGroupMessage = messageType == ChatType.GroupMessage;
    const originalMessage = isGroupMessage
      ? await this.prisma.groupMessage.findUnique({
          where: { id: messageId },
        })
      : await this.prisma.privateMessage.findUnique({
          where: { id: messageId },
        });
    if (!originalMessage) {
      throw new NotFoundException(
        `Original ${messageType}  with ${messageId} not found`,
      );
    }
    return this.prisma.groupMessage.create({
      data: {
        senderId,
        groupId,
        content: originalMessage.content,
        type: originalMessage.type,
        caption: originalMessage.caption,
        forwardedFromId: isGroupMessage ? messageId : null,
        forwardedFromPrivateId: isGroupMessage ? null : messageId,
      },
      include: GroupInclude,
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
  async sendMentionNotification(
    userNames: string[],
    mentioner: number,
    groupId: number,
    content: string,
  ) {
    const mentionerDetails = await this.prisma.user.findUnique({
      where: { id: mentioner },
    });
    const group = await this.prisma.orgGroup.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      return true;
    }
    const mentionedUsers = await this.prisma.user.findMany({
      where: { userName: { in: userNames } },
      include: { FCM: true },
    });
    if (mentionedUsers.length) {
      const tokens = mentionedUsers.map((user) => user.FCM[0].deviceId);
      await this.notificationService.sendNotificationToMultipleTokens({
        tokens,
        title: `${mentionerDetails.firstName} mentioned you in ${group.name}`,
        body: content,
        type: NotificationType.Communication,
        icon: 'https://code.enf',
      });
      return true;
    }

    return true;
  }
}
