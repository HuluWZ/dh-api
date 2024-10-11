import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrivateChatService } from './private-chat.service';
import { CreatePrivateMessageDto } from './dto/private.dto';

@ApiTags('Private Chat')
@ApiBearerAuth()
@Controller('private-chat')
export class PrivateChatController {
  constructor(private privateChatService: PrivateChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send Private Message' })
  @UseGuards(AuthGuard)
  async sendPrivateMessage(
    @Body() createPrivateMsg: CreatePrivateMessageDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    const message = await this.privateChatService.createPrivateMessage(
      userId,
      createPrivateMsg,
    );

    return { message: 'Message sent successfully', data: message };
  }

  @Patch(':id')
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
  @Get('my-chat-users')
  @ApiOperation({ summary: 'Get My Chat lists' })
  @UseGuards(AuthGuard)
  async getAllOrgGroups(@Req() req: any) {
    const userId: number = req.user.id;
    const chats = await this.privateChatService.getMyChats(userId);
    return { chats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Message By Id' })
  @UseGuards(AuthGuard)
  async getMessage(@Param('id') id: string) {
    const message = await this.privateChatService.getMessage(+id);
    return { message };
  }

  @Get('/chat/:senderId/:receiverId')
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Message By Id' })
  @UseGuards(AuthGuard)
  async deleteMessage(@Param('id') id: string) {
    const deleteMessage = await this.privateChatService.deleteMessage(+id);
    return { deleteMessage };
  }
}
