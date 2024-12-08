import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrivateChatService } from './private-chat.service';
import {
  CreateGroupMessageDto,
  CreatePrivateMessageDto,
} from './dto/private.dto';

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
  @Get('my-private-chat-users')
  @ApiOperation({ summary: 'Get My Chat lists' })
  @UseGuards(AuthGuard)
  async getAllOrgGroups(@Req() req: any) {
    const userId: number = req.user.id;
    const chats = await this.privateChatService.getMyChats(userId);
    return { chats };
  }
  @Get('search')
  @ApiOperation({ summary: 'Search My Chat Messages' })
  @UseGuards(AuthGuard)
  async searchMessages(
    @Req() req: any,
    @Query('content') content: string,
    @Query('type?') type: 'private' | 'group' | 'all' = 'all',
  ) {
    const userId = req.user.id; // Extract userId from JWT payload
    if (!content) {
      throw new BadRequestException('The "content" parameter is required.');
    }
    console.log(content, type);

    return this.privateChatService.searchMessagesByContent(
      userId,
      content,
      type,
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
}
