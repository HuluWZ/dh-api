import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export enum MessageType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
  Voice = 'Voice',
  Audio = 'Audio',
  File = 'File',
}
export enum ChatType {
  PrivateMessage = 'PrivateMessage',
  GroupMessage = 'GroupMessage',
}
export enum ActionType {
  Pin = 'Pin',
  Unpin = 'Unpin',
}

export class CreatePrivateMessageDto {
  @ApiProperty({ example: 'Hello man', description: 'Message Content' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Text | Image | Video | File | Voice',
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

  @ApiProperty({ example: 'Another Caption', description: 'Image Caption' })
  @IsString()
  @IsOptional()
  caption?: string;
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

  @ApiProperty({ example: 1, description: 'Image Caption' })
  @IsString()
  @IsOptional()
  caption?: string;
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

export class RemoveReactionDto {
  @ApiProperty({ example: 1, description: 'Reaction Id' })
  @IsInt()
  id: number;

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

  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;
}
export class MutePrivateChatDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '2',
    description: 'Private Chat Id',
  })
  @IsInt()
  chatUserId: number;

  @ApiProperty({
    example: '2025-09-30T00:00:00.000Z',
    description: 'Muted Until',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date(), {
    message: `Muting Chat date cannot be in the past.`,
  })
  mutedUntil: Date;
}
export class MuteGroupChatDto extends OmitType(MutePrivateChatDto, [
  'chatUserId',
]) {
  @IsNotEmpty()
  @ApiProperty({
    example: '4',
    description: 'Group Id',
  })
  @IsInt()
  groupId: number;
}
export class ForwardGroupMessageDto extends CommonForwardMessageDto {
  @ApiProperty({ example: 1, description: 'Group Id' })
  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;
}

export class CreateForwardMessageDto extends CommonForwardMessageDto {
  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;

  @ApiProperty({ example: 1, description: 'Group Id' })
  @IsInt()
  @IsOptional()
  groupId?: number;

  @ApiProperty({ example: 2, description: 'Receiver Id' })
  @IsInt()
  @IsOptional()
  receiverId?: number;
}
export class CreatePinUnpinMessageDto {
  @ApiProperty({ example: 1, description: 'Message Id' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;

  @ApiProperty({
    example: 'Pin | Unpin',
    description: 'Action Type',
  })
  @IsEnum(ActionType)
  action: ActionType;
}
export class CreateDeleteMessageDto {
  @ApiProperty({ example: 1, description: 'Message Id' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;
}

export class SetMessageSeenDto {
  @ApiProperty({ example: 1, description: 'Message Id' })
  @IsInt()
  id: number;

  @ApiProperty({
    example: 'GroupMessage | PrivateMessage',
    description: 'Message Type',
  })
  @IsEnum(ChatType)
  messageType: ChatType;
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
  forwardedFrom: {
    select: {
      id: true,
      senderId: true,
      content: true,
      groupId: true,
      type: true,
      is_seen: true,
      is_pinned: true,
      pinnedAt: true,
      createdAt: true,
      group: { select: { name: true } },
    },
  },
  forwardedFromPrivate: {
    select: {
      id: true,
      senderId: true,
      content: true,
      receiverId: true,
      type: true,
      is_seen: true,
      is_pinned: true,
      is_archived: true,
      pinnedAt: true,
      createdAt: true,
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
      receiver: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          userName: true,
          profile: true,
          phone: true,
        },
      },
    },
  },
  replies: true,
  forwards: true,
  Reaction: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          userName: true,
          profile: true,
        },
      },
    },
  },
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
  forwardedFromGroup: {
    select: {
      id: true,
      senderId: true,
      content: true,
      groupId: true,
      type: true,
      is_seen: true,
      is_pinned: true,
      is_archived: true,
      pinnedAt: true,
      createdAt: true,
      group: {
        select: {
          id: true,
          name: true,
          color: true,
          createdBy: true,
          org: {
            select: { ownerId: true },
          },
        },
      },
    },
  },
  forwardedFrom: {
    select: {
      id: true,
      senderId: true,
      content: true,
      receiverId: true,
      type: true,
      is_seen: true,
      is_pinned: true,
      pinnedAt: true,
      createdAt: true,
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
      receiver: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          userName: true,
          profile: true,
          phone: true,
        },
      },
    },
  },
  forwards: true,
  Reaction: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          userName: true,
          profile: true,
        },
      },
    },
  },
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
