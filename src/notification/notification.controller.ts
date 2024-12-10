import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Query,
  Patch,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  MultipleDeviceNotificationDto,
  NotificationDto,
  NotificationType,
  ScheduledNotificationDto,
} from './dto/notification.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Notifications')
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-notification')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Send a push notification to a single device' })
  async sendNotification(
    @Req() req: any,
    @Body() notificationData: NotificationDto,
  ) {
    const userId: number = req.user.id;
    const response = await this.notificationService.sendNotification(
      notificationData,
      userId,
    );
    return response;
  }

  @Post('scheduled-notification/:groupId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Send a scheduled push notification to a multiple members',
  })
  async sendScheduledNotification(
    @Req() req: any,
    @Param('groupId') groupId: number,
    @Body() scheduledNotification: ScheduledNotificationDto,
  ) {
    const userId: number = req.user.id;
    const response =
      await this.notificationService.sendScheduledMultipleNotifications(
        userId,
        groupId,
        scheduledNotification,
      );
    return response;
  }

  @Get('my-notifications')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Get all My notifications set seen to one of [all, true and false] value',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    description: 'Filter notifications by type',
  })
  async getMyNotifications(
    @Req() req: any,
    @Query('seen') seen: string,
    @Query('type') type: NotificationType,
  ) {
    const seenValue =
      seen.toLowerCase() === 'all'
        ? null
        : seen.toLowerCase() === 'true'
          ? true
          : false;
    const typeValue = type ? type : null;

    return this.notificationService.getMyNotifications(1, seenValue, typeValue);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Notification By Id' })
  @UseGuards(AuthGuard)
  async getNotificationById(@Param('id') id: string) {
    return this.notificationService.getNotificationById(+id);
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
  @Patch('id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Set Seen Notification Status' })
  async updateNotificationSeenStatus(@Param('id') id: string) {
    const notification =
      await this.notificationService.getNotificationById(+id);
    if (!notification) {
      throw new NotFoundException(`Notification with id #${id} not found!`);
    }
    if (notification.is_seen) {
      return notification;
    }
    return this.notificationService.updateNotificationStatus(+id);
  }
}
