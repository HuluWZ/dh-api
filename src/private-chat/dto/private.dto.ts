import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
enum MessageType {
  Text = 'Text',
  Video = 'Video',
  Audio = 'Audio',
}
export class CreatePrivateMessageDto {
  @ApiProperty({ example: 'Hello man', description: 'Message Content' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Text | Image | Video',
    description: 'Message Type',
  })
  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType;

  @ApiProperty({ example: 1, description: 'Receiver Id' })
  @IsInt()
  receiverId: number;

  @ApiProperty({ example: 1, description: 'Reply  Message Id' })
  @IsInt()
  @IsOptional()
  replyToId?: number;
}

export class CreateGroupMessageDto {
  @ApiProperty({ example: 'Hello Everyone', description: 'Message Content' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Text | Image | Video',
    description: 'Message Type',
  })
  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType;

  @ApiProperty({ example: 1, description: 'Group Id' })
  @IsInt()
  groupId: number;

  @ApiProperty({ example: 1, description: 'Reply Message Id' })
  @IsInt()
  @IsOptional()
  replyToId?: number;
}

export const GroupInclude = {
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
  replies: true,
  group: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
};
export const PrivateInclude = {
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
  replies: true,
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
};
