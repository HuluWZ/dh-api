import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class NotificationDto {
  @ApiProperty({
    type: String,
    description: 'Client device token',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    type: String,
    description: 'Notification Title',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Notification Body',
  })
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Notification Icon / Logo',
  })
  icon: string;
}

export class MultipleDeviceNotificationDto extends PickType(NotificationDto, [
  'title',
  'body',
  'icon',
]) {
  @ApiProperty({
    type: String,
    description: 'Clients device token',
  })
  tokens: string[];
}
