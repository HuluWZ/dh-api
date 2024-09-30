import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { firebaseConfigType } from 'src/config/firebase.config';
import {
  MultipleDeviceNotificationDto,
  NotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly firebaseConfig: any;

  constructor(private readonly configService: ConfigService) {
    this.firebaseConfig =
      this.configService.get<firebaseConfigType>('firebase');
    admin.initializeApp({
      credential: admin.credential.cert({
        ...this.firebaseConfig,
      }),
    });
  }

  async sendNotification({ token, title, body, icon }: NotificationDto) {
    const message = {
      token,
      data: {
        title,
        body,
        icon,
      },
    };
    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to device:', response);

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
}
