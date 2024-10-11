import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrivateMessageDto } from './dto/private.dto';

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
      include: {
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
            lastName: true,
            userName: true,
            profile: true,
            phone: true,
          },
        },
      },
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
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
            lastName: true,
            userName: true,
            profile: true,
            phone: true,
          },
        },
      },
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
        senderId: true,
        receiverId: true,
        createdAt: true,
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
    return this.prisma.privateMessage.findFirst({ where: { id } });
  }
  async deleteMessage(id: number) {
    return this.prisma.privateMessage.delete({ where: { id } });
  }
  async updateMessageSeen(id: number) {
    return this.prisma.privateMessage.update({
      where: { id },
      data: { is_seen: true },
    });
  }
}
