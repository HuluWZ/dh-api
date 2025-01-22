import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { firebaseConfigType } from 'src/config/firebase.config';
import { PrismaService } from 'src/prisma';
import {
  MultipleDeviceNotificationDto,
  NotificationDto,
  ScheduledNotificationDto,
} from './dto/notification.dto';
import { NotificationType } from '@prisma/client';
import { OrgGroupService } from 'src/org-group/org-group.service';

@Injectable()
export class NotificationService {
  private readonly firebaseConfig: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly orgGroupService: OrgGroupService,
  ) {
    this.firebaseConfig =
      this.configService.get<firebaseConfigType>('firebase');
    admin.initializeApp({
      credential: admin.credential.cert({
        ...this.firebaseConfig,
      }),
    });
  }
  async sendInvitationNotification(userIds: number[], orgName: string) {
    const tokens = await this.prismaService.fCM.findMany({
      where: { userId: { in: userIds } },
    });
    await Promise.all(
      tokens.map(async ({ deviceId }) => {
        const notification = {
          token: deviceId,
          title: `Invitation to Org  # ${orgName} Requested`,
          body: "You've been invited to join an organization",
          icon: 'https://example.com/icon.png',
        };
        await this.sendNotification(notification, userIds[0]);
      }),
    );
  }
  async sendNotification(
    { token, title, body, icon }: NotificationDto,
    userId: number,
  ) {
    const message = {
      token,
      data: {
        title,
        body,
        icon,
      },
      notification: {
        title,
        body,
      },
    };
    try {
      console.log('Sending message:', message, userId);
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to device:', response);
      await this.createNotification({ token, title, body, icon }, userId);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendNotificationToMultipleTokens({
    tokens,
    title,
    body,
    type,
    icon,
  }: MultipleDeviceNotificationDto) {
    const message = {
      notification: {
        title,
        body,
        type,
        icon,
      },
      tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent multiple messages:', response);
      return {
        success: true,
        message: `Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`,
      };
    } catch (error) {
      console.log('Error sending messages:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  async getMyNotifications(
    userId: number,
    is_seen: boolean | null,
    type: NotificationType,
  ) {
    const condition = is_seen === null ? { userId } : { userId, is_seen };
    return this.prismaService.notification.findMany({
      where: { ...condition, type },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
            phone: true,
            profile: true,
          },
        },
      },
    });
  }

  async getNotificationById(id: number) {
    return this.prismaService.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
            phone: true,
            profile: true,
          },
        },
      },
    });
  }
  async updateNotificationStatus(id: number) {
    return this.prismaService.notification.update({
      where: { id },
      data: { is_seen: true },
    });
  }
  async createNotification(
    notificationData: NotificationDto,
    userId: number,
    is_schedule: boolean = false,
  ) {
    const { token, ...others } = notificationData;
    return this.prismaService.notification.create({
      data: { ...others, userId },
    });
  }
  async sendScheduledMultipleNotifications(
    userId: number,
    groupId: number,
    scheduledNotification: ScheduledNotificationDto,
  ) {
    const group = await this.orgGroupService.getGroup(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const { title, body, icon } = scheduledNotification;
    const members = group.OrgGroupMember.map((member) => member.memberId);
    const memberIds = scheduledNotification.memberIds.filter((id) =>
      members.includes(id),
    );
    const tokens = await this.prismaService.fCM.findMany({
      where: { userId: { in: memberIds } },
    });
    if (!tokens.length) {
      throw new NotFoundException('No tokens found');
    }
    await Promise.all(
      tokens.map(async ({ deviceId }) => {
        const message = {
          token: deviceId,
          data: {
            title,
            body,
            icon,
          },
          notification: {
            title,
            body,
          },
        };
        const response = await admin.messaging().send(message);
        await this.createNotification(
          { token: deviceId, title, body, icon },
          userId,
          true,
        );
      }),
    );
  }
}
