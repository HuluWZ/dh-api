import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { firebaseConfigType } from 'src/config/firebase.config';
import { PrismaService } from 'src/prisma';
import {
  MultipleDeviceNotificationDto,
  NotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly firebaseConfig: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.firebaseConfig =
      this.configService.get<firebaseConfigType>('firebase');
    admin.initializeApp({
      credential: admin.credential.cert({
        ...this.firebaseConfig,
      }),
    });
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
    icon,
  }: MultipleDeviceNotificationDto) {
    const message = {
      notification: {
        title,
        body,
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

  async getMyNotifications(userId: number, is_seen: boolean | null) {
    const condition = is_seen === null ? { userId } : { userId, is_seen };
    return this.prismaService.notification.findMany({
      where: { ...condition },
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
  async createNotification(notificationData: NotificationDto, userId: number) {
    const { token, ...others } = notificationData;
    return this.prismaService.notification.create({
      data: { ...others, userId },
    });
  }
}
