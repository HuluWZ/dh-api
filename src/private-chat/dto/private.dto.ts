import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
enum MessageType {
  Text = 'Text',
  Video = 'Video',
  Audio = 'Audio',
}
enum ChatType {
  PrivateMessage = 'PrivateMessage',
  GroupMessage = 'GroupMessage',
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
export class CreateSavedMessageDto {
  @ApiProperty({
    example: 'PrivateMessage | GroupMessage | Video',
    description: 'Chat Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;

  @ApiProperty({ example: 1, description: 'Message Id' })
  @IsInt()
  messageId: number;
}
export class DeleteMultiplePrivateGroupMessageDto {
  @ApiProperty({ example: ['1'], description: 'Private / Group Message Ids' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map(Number))
  messageId: number[];
}
export class CreateReactionDto {
  @ApiProperty({ example: 1, description: 'Message Id' })
  @IsInt()
  messageId: number;

  @ApiProperty({ example: '🤟', description: 'Reaction Content' })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;
}
export class CommonForwardMessageDto {
  @ApiProperty({ example: 1, description: 'Message Id' })
  @IsInt()
  @IsNotEmpty()
  messageId: number;
}

export class ForwardPrivateMessageDto extends CommonForwardMessageDto {
  @ApiProperty({ example: 1, description: 'Receiver Id' })
  @IsInt()
  @IsNotEmpty()
  receiverId: number;
}

export class ForwardGroupMessageDto extends CommonForwardMessageDto {
  @ApiProperty({ example: 1, description: 'Group Id' })
  @IsInt()
  @IsNotEmpty()
  groupId: number;
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
  Reaction: true,
  group: {
    select: {
      id: true,
      name: true,
      color: true,
      createdBy: true,
      org: {
        select: { ownerId: true },
      },
      OrgGroupAdmin: { select: { memberId: true } },
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
  Reaction: true,
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
