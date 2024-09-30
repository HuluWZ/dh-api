import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiOperation } from '@nestjs/swagger';
import {
  MultipleDeviceNotificationDto,
  NotificationDto,
} from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-notification')
  @ApiOperation({ summary: 'Send a push notification to a single device' })
  async sendNotification(@Body() notificationData: NotificationDto) {
    return this.notificationService.sendNotification(notificationData);
  }

  @Post('send-multiple-notifications')
  @ApiOperation({ summary: 'Send push notifications to multiple devices' })
  async sendMultipleNotifications(
    @Body() multipleNotificationData: MultipleDeviceNotificationDto,
  ) {
    return this.notificationService.sendNotificationToMultipleTokens(
      multipleNotificationData,
    );
  }
}
