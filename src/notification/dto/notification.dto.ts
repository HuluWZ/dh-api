import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
