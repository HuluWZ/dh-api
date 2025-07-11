import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrivateChatService } from './private-chat.service';
import {
  CreateGroupMessageDto,
  CreatePrivateMessageDto,
  CreateReactionDto,
  CreateSavedMessageDto,
  DeleteMultiplePrivateGroupMessageDto,
  ForwardGroupMessageDto,
  ForwardPrivateMessageDto,
  MuteGroupChatDto,
  MutePrivateChatDto,
} from './dto/private.dto';
import { extractMentionedUsers } from './utils/chat.utls';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class PrivateChatController {
  constructor(private privateChatService: PrivateChatService) {}

  @Post('private-message')
  @ApiOperation({ summary: 'Send Private Message' })
  @UseGuards(AuthGuard)
  async sendPrivateMessage(
    @Body() createPrivateMsg: CreatePrivateMessageDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    if (userId === createPrivateMsg.receiverId) {
      throw new BadRequestException(`You cannot send a message to yourself!`);
    }

    if (createPrivateMsg.replyToId) {
      const replyMessage = await this.privateChatService.getMessage(
        createPrivateMsg.replyToId,
      );
      if (!replyMessage) {
        throw new NotFoundException(
          `Message with Id #${createPrivateMsg.replyToId} not found!`,
        );
      }
    }
    const message = await this.privateChatService.createPrivateMessage(
      userId,
      createPrivateMsg,
    );

    return { message: 'Message sent successfully', data: message };
  }
  @Post('delete-private-message')
  @ApiOperation({ summary: 'Delete Multiple Private Message' })
  @UseGuards(AuthGuard)
  async deletePrivateMessages(
    @Body() deletePrivateMessage: DeleteMultiplePrivateGroupMessageDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    const messages = await this.privateChatService.getMultiplePrivateMessages(
      deletePrivateMessage.messageId,
    );

    if (messages.length === 0) {
      throw new NotFoundException('No messages found for the provided IDs.');
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const updates = messages.map((message) => {
      const isSender = message.senderId === userId;
      const isReceiver = message.receiverId === userId;

      if (!isSender && !isReceiver) {
        throw new ForbiddenException(
          'You are not authorized to delete some of these messages.',
        );
      }

      // Determine deletion type
      if (isSender && message.createdAt > fiveMinutesAgo) {
        // Within 5 minutes: Delete for both sender and receiver
        return this.privateChatService.updatePrivateMessageDelete(
          message.id,
          true,
          true,
        );
      } else if (isSender) {
        // After 5 minutes: Delete only for sender
        return this.privateChatService.updatePrivateMessageDelete(
          message.id,
          true,
          false,
        );
      } else if (isReceiver) {
        // Receiver deletes message for themselves
        return this.privateChatService.updatePrivateMessageDelete(
          message.id,
          false,
          true,
        );
      }

      throw new BadRequestException(
        'Invalid operation for one or more messages.',
      );
    });

    // Execute all updates
    return Promise.all(updates);
  }
  @Post('delete-group-message')
  @ApiOperation({ summary: 'Delete Multiple Private Message' })
  @UseGuards(AuthGuard)
  async deleteGroupMessages(
    @Body() deleteGroupMessage: DeleteMultiplePrivateGroupMessageDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    let validMessageIds: number[] = [];
    for (let messageId of deleteGroupMessage.messageId) {
      const groupMessage =
        await this.privateChatService.getGroupMessage(messageId);
      const isOrgOwner = groupMessage.group.org.ownerId === userId;
      const isGroupAdmin = groupMessage.group.OrgGroupAdmin.some(
        (admin) => admin.memberId === userId,
      );
      if (groupMessage && (isOrgOwner || isGroupAdmin)) {
        validMessageIds.push(messageId);
      }
    }
    if (validMessageIds.length === 0) {
      throw new BadRequestException(
        'Invalid Message Ids or You are not authorized to delete these messages',
      );
    }
    const message =
      await this.privateChatService.deleteMultipleGroupMessage(validMessageIds);

    return { message: 'Message Deleted successfully', data: message };
  }

  @Post('saved-message')
  @ApiOperation({ summary: 'Save Group | Private Message' })
  @UseGuards(AuthGuard)
  async saveMessage(
    @Req() req: any,
    @Body() createSavedMsg: CreateSavedMessageDto,
  ) {
    const userId: number = req.user.id;
    const savedMessage = await this.privateChatService.saveMessage(
      userId,
      createSavedMsg,
    );
    return { message: 'Message saved successfully', data: savedMessage };
  }

  @Post('mute-private-chat')
  @ApiOperation({ summary: 'Mute Private Chat' })
  @UseGuards(AuthGuard)
  async mutePrivateChat(
    @Req() req: any,
    @Body() mutePrivateChat: MutePrivateChatDto,
  ) {
    const userId: number = req.user.id;
    const mutedChat = await this.privateChatService.mutePrivateChat(
      userId,
      mutePrivateChat,
    );
    return { message: 'Chat Muted successfully', data: mutedChat };
  }
  @Post('unmute-private-chat/:chatId')
  @ApiOperation({ summary: 'Unmute Private Chat' })
  @UseGuards(AuthGuard)
  async unmutePrivateChat(@Req() req: any, @Param('chatId') chatId: number) {
    const userId: number = req.user.id;
    const unmutedChat = await this.privateChatService.unmutePrivateChat(
      userId,
      chatId,
    );
    return { message: 'Chat Unmuted successfully', data: unmutedChat };
  }
  @Post('unsend-private-message/:id')
  @ApiOperation({ summary: 'Unsend Private Chat' })
  @UseGuards(AuthGuard)
  async unsendPrivateMessage(@Req() req: any, @Param('id') id: number) {
    const userId: number = req.user.id;
    const privateMessage = await this.privateChatService.getMessage(id);
    if (!privateMessage) {
      throw new NotFoundException(`Message with Id #${id} not found!`);
    }
    if (privateMessage.senderId !== userId) {
      throw new ForbiddenException('Only Sender can unsend the message.');
    }
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (privateMessage.createdAt < fiveMinutesAgo) {
      throw new ForbiddenException(
        'You can only unsend messages sent within the last 5 minutes.',
      );
    }
    if (privateMessage.is_seen) {
      throw new ForbiddenException(
        'You can only unsend messages that have not been seen by the receiver yet.',
      );
    }

    const unmutedChat = await this.privateChatService.deleteMessage(id);
    return { message: 'Message Unsent successfully', data: unmutedChat };
  }
  @Post('unsend-group-message/:id')
  @ApiOperation({ summary: 'Unsend Group Message' })
  @UseGuards(AuthGuard)
  async unsendGroupMessage(@Req() req: any, @Param('id') id: number) {
    const userId: number = req.user.id;
    const groupMessage = await this.privateChatService.getGroupMessage(id);
    if (!groupMessage) {
      throw new NotFoundException(`Message with Id #${id} not found!`);
    }
    if (groupMessage.senderId !== userId) {
      throw new ForbiddenException('Only Sender can unsend the message.');
    }
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    if (groupMessage.createdAt < fiveMinutesAgo) {
      throw new ForbiddenException(
        'You can only unsend messages sent within the last 5 minutes.',
      );
    }
    if (groupMessage.is_seen) {
      throw new ForbiddenException(
        'You can only unsend messages that have not been seen by the receiver yet.',
      );
    }

    const unmutedChat = await this.privateChatService.deleteGroupMessage(id);
    return { message: 'Message Unsent successfully', data: unmutedChat };
  }
  @Post('mute-group-chat')
  @ApiOperation({ summary: 'Mute Group Chat' })
  @UseGuards(AuthGuard)
  async muteGroupChat(
    @Req() req: any,
    @Body() muteGroupChat: MuteGroupChatDto,
  ) {
    const userId: number = req.user.id;
    const mutedChat = await this.privateChatService.muteGroupChat(
      userId,
      muteGroupChat,
    );
    return { message: 'Group Chat Muted successfully', data: mutedChat };
  }
  @Post('unmute-group-chat/:groupId')
  @ApiOperation({ summary: 'Unmute Group Chat' })
  @UseGuards(AuthGuard)
  async unmuteGroupChat(@Req() req: any, @Param('groupId') groupId: number) {
    const userId: number = req.user.id;
    const unmutedChat = await this.privateChatService.unmuteGroupChat(
      userId,
      groupId,
    );
    return { message: 'Group Chat Unmuted successfully', data: unmutedChat };
  }

  @Post('create-reaction')
  @ApiOperation({ summary: 'React to Private / Group Message' })
  @UseGuards(AuthGuard)
  async createReaction(
    @Req() req: any,
    @Body() createReaction: CreateReactionDto,
  ) {
    const userId: number = req.user.id;
    const reaction = await this.privateChatService.createReactions(
      userId,
      createReaction,
    );
    return { message: 'Reaction created successfully', data: reaction };
  }
  @Post('forward-private-message')
  @ApiOperation({ summary: 'Forward Private Message' })
  @UseGuards(AuthGuard)
  async forwardPrivateMessage(
    @Req() req: any,
    @Body() forwardPrivateMessage: ForwardPrivateMessageDto,
  ) {
    const userId: number = req.user.id;
    const reaction = await this.privateChatService.forwardToPrivateMessage(
      userId,
      forwardPrivateMessage,
    );
    return { message: 'Message forwarded successfully', data: reaction };
  }

  @Post('forward-group-message')
  @ApiOperation({ summary: 'Forward Group Message' })
  @UseGuards(AuthGuard)
  async forwardGroupMessage(
    @Req() req: any,
    @Body() forwardGroupMessage: ForwardGroupMessageDto,
  ) {
    const userId: number = req.user.id;
    const reaction = await this.privateChatService.forwardToGroupMessage(
      userId,
      forwardGroupMessage,
    );
    return { message: 'Message forwarded successfully', data: reaction };
  }
  @Patch('private-message/:id')
  @ApiOperation({ summary: 'Update Message is_seen status' })
  @UseGuards(AuthGuard)
  async updateOrgGroup(@Param('id') id: string) {
    const message = await this.privateChatService.getMessage(+id);
    if (!message) {
      throw new NotFoundException(`Message with Id #${id} not found!`);
    }
    const updatedMessage = await this.privateChatService.updateMessageSeen(+id);
    return { message: 'Message status updated successfully', updatedMessage };
  }
  @Patch('private-message/pinned/:id')
  @ApiOperation({ summary: 'Toggle Group is_pinned status' })
  @UseGuards(AuthGuard)
  async updatePrivateMessagePinned(@Param('id') id: string) {
    const message = await this.privateChatService.getMessage(+id);
    if (!message) {
      throw new NotFoundException(`Message with Id #${id} not found!`);
    }
    const updatedMessage =
      await this.privateChatService.updatePrivateMessageIsPinned(
        +id,
        !message.is_pinned,
      );
    return {
      message: 'Message Is Pinned updated successfully',
      updatedMessage,
    };
  }
  @Get('my-conversations')
  @ApiOperation({ summary: 'Get My Conversations' })
  @UseGuards(AuthGuard)
  async getMyConversations(@Req() req: any) {
    const userId: number = req.user.id;
    const conversations =
      await this.privateChatService.getMyRecentConversations(userId);
    return { conversations };
  }

  @Get('my-private-chat-users')
  @ApiOperation({ summary: 'Get My Chat lists' })
  @UseGuards(AuthGuard)
  async getAllOrgGroups(@Req() req: any) {
    const userId: number = req.user.id;
    const chats = await this.privateChatService.getMyChats(userId);
    return { chats };
  }
  @Get('search/')
  @ApiOperation({ summary: 'Search My Conversations' })
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'receiverId', required: false })
  async searchMessages(
    @Req() req: any,
    @Query('content') content: string,
    @Query('groupId') groupId?: string,
    @Query('receiverId') receiverId?: string,
  ) {
    console.log({ content, groupId, receiverId });
    const userId = 5;
    if (!content) {
      throw new BadRequestException('The "content" parameter is required.');
    }
    if ((groupId && receiverId) || (!groupId && !receiverId)) {
      throw new BadRequestException(
        'Either "groupId" or "receiverId" must be provided, but not both.',
      );
    }
    if (groupId) {
      return this.privateChatService.searchMessagesByContent(
        userId,
        content,
        +groupId,
      );
    }
    if (receiverId) {
      return this.privateChatService.searchMessagesByContent(
        userId,
        content,
        undefined,
        +receiverId,
      );
    }
  }
  @Post('group-chat-mention/:groupId')
  @ApiOperation({ summary: 'Mention in GroupChat Notification' })
  @UseGuards(AuthGuard)
  async mentionGroupChatNotification(
    @Req() req: any,
    @Param('groupId') groupId: number,
    @Query('content') content: string,
    @Query('mention') mention: string,
  ) {
    const userId = req.user.id; // Extract userId from JWT payload
    const mentions = extractMentionedUsers(mention);
    return this.privateChatService.sendMentionNotification(
      mentions,
      userId,
      groupId,
      content,
    );
  }

  @Get('private/:id')
  @ApiOperation({ summary: 'Get Message By Id' })
  @UseGuards(AuthGuard)
  async getMessage(@Param('id') id: string) {
    const message = await this.privateChatService.getMessage(+id);
    return { message };
  }

  @Get('/private/:senderId/:receiverId')
  @ApiOperation({ summary: 'Get Private Users Chat History' })
  @UseGuards(AuthGuard)
  async getAllGroupsByOrgId(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    const message = await this.privateChatService.findMessages(
      +senderId,
      +receiverId,
    );
    return { message };
  }

  @Delete('private/:id')
  @ApiOperation({ summary: 'Delete Message By Id' })
  @UseGuards(AuthGuard)
  async deleteMessage(@Param('id') id: string) {
    const deleteMessage = await this.privateChatService.deleteMessage(+id);
    return { deleteMessage };
  }
  @Delete('remove-reaction/:id')
  @ApiOperation({ summary: 'Remove Reaction to Private / Group Message' })
  @UseGuards(AuthGuard)
  async removeReaction(@Param('id') id: number, @Req() req: any) {
    const userId: number = req.user.id;
    const reaction = await this.privateChatService.removeReaction(userId, id);
    return { message: 'Reaction removed successfully', data: reaction };
  }

  @Post('group-message')
  @ApiOperation({ summary: 'Send Group Message' })
  @UseGuards(AuthGuard)
  async sendGroupMessage(
    @Body() createGroupMessage: CreateGroupMessageDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    if (createGroupMessage.replyToId) {
      const replyMessage = await this.privateChatService.getGroupMessage(
        createGroupMessage.replyToId,
      );
      if (!replyMessage) {
        throw new NotFoundException(
          `Group Message with Id #${createGroupMessage.replyToId} not found!`,
        );
      }
    }
    const message = await this.privateChatService.createGroupMessage(
      userId,
      createGroupMessage,
    );

    return { message: 'Message sent successfully', data: message };
  }
  @Patch('group-message/:id')
  @ApiOperation({ summary: 'Update Group is_seen status' })
  @UseGuards(AuthGuard)
  async updateGroupMessage(@Param('id') id: string) {
    const message = await this.privateChatService.getGroupMessage(+id);
    if (!message) {
      throw new NotFoundException(`Message with Id #${id} not found!`);
    }
    const updatedMessage =
      await this.privateChatService.updateGroupMessageSeen(+id);
    return { message: 'Message status updated successfully', updatedMessage };
  }
  @Patch('group-message/pinned/:id')
  @ApiOperation({ summary: 'Toggle Group is_pinned status' })
  @UseGuards(AuthGuard)
  async updateGroupMessagePinned(@Param('id') id: string) {
    const message = await this.privateChatService.getGroupMessage(+id);
    if (!message) {
      throw new NotFoundException(`Message with Id #${id} not found!`);
    }
    const updatedMessage =
      await this.privateChatService.updateGroupMessageIsPinned(
        +id,
        !message.is_pinned,
      );
    return {
      message: 'Message Is Pinned updated successfully',
      updatedMessage,
    };
  }

  @Get('group-message/:id')
  @ApiOperation({ summary: 'Get Group Message By Id' })
  @UseGuards(AuthGuard)
  async getGroupMessageById(@Param('id') id: string) {
    const message = await this.privateChatService.getGroupMessage(+id);
    return { message };
  }
  @Get('group-message/group/:groupId')
  @ApiOperation({ summary: 'Get Group Message By Group Id' })
  @UseGuards(AuthGuard)
  async getGroupMessages(@Param('groupId') groupId: string) {
    const GroupMessages =
      await this.privateChatService.getGroupMessageByGroupId(+groupId);
    return { GroupMessages };
  }
  @Delete('saved-message/:id')
  @ApiOperation({ summary: 'Get Saved Message By Id' })
  @UseGuards(AuthGuard)
  async getSavedMessageById(@Req() req: any, @Param('id') id: number) {
    const userId: number = req.user.id;
    const message = await this.privateChatService.removeSavedMessage(
      userId,
      id,
    );
    return { message };
  }
}
