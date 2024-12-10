import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';

export enum NotificationType {
  Task = 'Task',
  Communication = 'Communication',
  System = 'System',
  Others = 'Others',
}

export class NotificationDto {
  @ApiProperty({
    example: 'aeake#2',
    description: 'Client device token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'You Company Invitation Verified :fire',
    description: 'Notification Title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'hope you are doing well',
    description: 'Notification Body',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: 'https://code.enf',
    description: 'Notification Icon / Logo',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    example: 'Task / Communication / System / Others',
    description: 'Notification Type',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}

export class MultipleDeviceNotificationDto extends PickType(NotificationDto, [
  'title',
  'body',
  'icon',
  'type',
]) {
  @ApiProperty({
    type: String,
    description: 'Clients device token',
  })
  tokens: string[];
}

export class ScheduledNotificationDto {
  @ApiProperty({ example: ['1'], description: 'Member Ids' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map(Number))
  memberIds: number[];

  @ApiProperty({
    example: 'Exciting Announcement',
    description: 'Notification Title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'hope you are doing well',
    description: 'Notification Body',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: 'https://code.enf',
    description: 'Notification Icon / Logo',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    example: 'Task / Communication / System / Others',
    description: 'Notification Type',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    example: '2025-09-30T00:00:00.000Z',
    description: 'Scheduled Deadline',
  })
  @Transform(({ value }) => value && new Date(value))
  @IsOptional()
  @IsDate()
  @MinDate(new Date(), {
    message: `Scheduled notification deadline must be in the future.`,
  })
  deadline?: Date;
}
