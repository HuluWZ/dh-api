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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  MultipleDeviceNotificationDto,
  NotificationDto,
} from './dto/notification.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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
    return this.notificationService.sendNotification(notificationData, userId);
  }

  @Get('my-notifications')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Get all My notifications set seen to one of [all, true and false] value',
  })
  async getMyNotifications(@Req() req: any, @Query('seen') seen: string) {
    const seenValue =
      seen.toLowerCase() === 'all'
        ? null
        : seen.toLowerCase() === 'true'
          ? true
          : false;
    return this.notificationService.getMyNotifications(1, seenValue);
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
