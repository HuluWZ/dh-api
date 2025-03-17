import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrivateChatService } from './private-chat.service';
import {
  ChatType,
  CreateDeleteMessageDto,
  CreateForwardMessageDto,
  CreateGroupMessageDto,
  CreatePinUnpinMessageDto,
  CreatePrivateMessageDto,
  CreateReactionDto,
  RemoveReactionDto,
  SetMessageSeenDto,
} from './dto/private.dto';
import { UseGuards } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { AuthService } from 'src/auth/auth.service';
import { MessageType, User } from '@prisma/client';
import { PrivateChatGuard } from './private-chat.guard';
import { OrgGroupService } from 'src/org-group/org-group.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PrivateChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private userSocketMap: Map<number, string> = new Map();

  constructor(
    private privateChatService: PrivateChatService,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly orgGroupService: OrgGroupService,
  ) {}

  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token =
      client.handshake.headers.authorization &&
      client.handshake.headers?.authorization?.split(' ')[1];
    console.log({ token });
    if (!token) {
      client.emit('error', { message: 'Please provide token' });
      return;
    }
    try {
      const resp = await this.jwtService.verify(token);
      console.log({ resp });
      if (!resp) {
        client.emit('error', { message: 'Unauthorized Access' });
      }
      const user = await this.authService.getMe(+resp.sub);
      client['user'] = user;
      if (user) {
        client.join(`user:${user.id}`);
        const { groups, myGroups } =
          await this.orgGroupService.getMyGroupMembers(user.id);
        const myCreatedGroups = await this.orgGroupService.getMyCreatedGroups(
          user.id,
        );
        const myCreatedGroupIds = myCreatedGroups.map((group) => group.id);
        const allGroups = groups?.map((group) => group.id) || [];
        const allMYGroups = myGroups.map((group) => group.id);
        const uniqueGroupIds = new Set([
          ...allGroups,
          ...allMYGroups,
          ...myCreatedGroupIds,
        ]);
        console.log({
          uniqueGroupIds,
        });
        for (const groupId of uniqueGroupIds) {
          client.join(`group:${groupId}`);
          console.log(`User ${user.id} joined group ${groupId}`);
        }
        console.log(`Client connected:  ${user.id}, SocketId: ${client.id} `);
      } else {
        console.log('Unauthorized user connected');
        client.emit('error', { message: 'Unauthorized Access' });
        client.disconnect();
      }
    } catch (e) {
      console.error('Token validation error:', e.message);
      client.emit('error', { message: 'Unauthorized Access' });
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user: User = client['user']; // Assuming the Auth Guard populates user
    // if (user) {
    //   await this.redisService.removeUserSocket(user.id); // Remove on disconnect
    console.log(`User disconnected: ${user?.id}, socketId: ${client.id}`);
    // }
  }

  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreatePrivateMessageDto) {
    try {
      console.log(' Chat Payload ', payload, client['user']);
      const sender: User = client['user'];
      if (
        payload.type !== MessageType.Image &&
        payload.type !== MessageType.File &&
        payload.caption
      ) {
        client.emit('error', {
          message: 'Image caption is only required for type  Image',
        });
        return;
      }
      const newMessage = await this.privateChatService.createPrivateMessage(
        sender.id,
        payload,
      );
      if (payload.replyToId) {
        this.server
          .to(`user:${payload.receiverId}`)
          .to(`user:${sender.id}`)
          .emit('replyMessage', newMessage);
        return;
      }
      console.log(`Message sent to user: ${payload.receiverId}`);
      this.server
        .to(`user:${payload.receiverId}`)
        .to(`user:${sender.id}`)
        .emit('newMessage', newMessage);
      client.emit('notif', {
        message: `Message sent to  user # ${payload.receiverId} successfully`,
      });
    } catch (error) {
      console.error('Error sending message:', error?.response?.message);
      client.emit('error', {
        message: `Failed to send message :${error?.response?.message}`,
      });
    }
  }
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(client: Socket, payload: CreateGroupMessageDto) {
    try {
      const sender: User = client['user'];
      const groupMessage = await this.privateChatService.createGroupMessage(
        sender.id,
        payload,
      );
      if (
        payload.type !== MessageType.Image &&
        payload.type !== MessageType.File &&
        payload.caption
      ) {
        client.emit('error', {
          message: 'Image caption is only required for type  Image',
        });
        return;
      }
      if (payload.replyToId) {
        this.server
          .to(`group:${payload.groupId}`)
          .emit('replyGroupMessage', groupMessage);
        return;
      }
      this.server
        .to(`group:${payload.groupId}`)
        .emit('newGroupMessage', groupMessage);
      console.log(
        `Group message sent to group ${payload.groupId} from ${sender.firstName} ${sender.middleName}.`,
      );
    } catch (error) {
      console.error('Error sending group message:', error?.response?.message);
      client.emit('error', {
        message: `Failed to send group message : ${error?.response?.message}`,
      });
    }
  }

  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('findMessages')
  async handleFindMessages(client: Socket, payload: { receiverId: number }) {
    try {
      console.log({ client: client['user'] });
      const senderId: number = client['user'].id;
      const messages = await this.privateChatService.findMessages(
        senderId,
        payload.receiverId,
      );
      client.emit('messageHistory', messages);
    } catch (error) {
      console.error('Error fetching message history:', error);
      client.emit('error', {
        message: `Failed to fetch messages :${error?.response?.message}`,
      });
    }
  }

  // Handle fetching the list of users the authenticated user has chatted with
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('getMyChats')
  async handleGetMyChats(client: Socket) {
    try {
      console.log({ client: client['user'] });
      const senderId: number = client['user'].id;
      const chatUsers = await this.privateChatService.getMyChats(senderId);
      client.emit('myChats', chatUsers);
    } catch (error) {
      console.error('Error fetching chat list:', error);
      client.emit('error', {
        message: `Failed to fetch chat list :${error?.response?.message}`,
      });
    }
  }
  /**
   *  Reaction
   *  RemoveReaction
   *  Pin
   *  Reply
   *  Delete
   * @param client
   * @param payload
   */
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('react')
  async sendReaction(client: Socket, payload: CreateReactionDto) {
    try {
      const senderId: number = client['user'].id;
      const reactions = await this.privateChatService.createReactions(
        senderId,
        payload,
      );
      if (payload.messageType == ChatType.GroupMessage) {
        this.server
          .to(`group:${reactions.groupMessage.groupId}`)
          .emit('reactions', reactions);
      } else {
        this.server
          .to(`user:${reactions.privateMessage.senderId}`)
          .to(`user:${reactions.privateMessage.receiverId}`)
          .emit('reactions', reactions);
      }
      console.log({ reactions });
    } catch (error) {
      console.error(
        'Error react on chat list:',
        error?.response,
        error?.message,
      );
      client.emit('error', {
        message: `Failed to react on chat list :${error?.response?.message}`,
      });
    }
  }

  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('remove-reaction')
  async removeReaction(client: Socket, payload: { id: number }) {
    try {
      const senderId: number = client['user'].id;
      const reactions = await this.privateChatService.removeReaction(
        senderId,
        payload.id,
      );
      if (reactions.groupMessageId) {
        this.server
          .to(`group:${reactions.groupMessage.groupId}`)
          .emit('remove-reactions', reactions);
      } else {
        this.server
          .to(`user:${reactions.privateMessage.senderId}`)
          .to(`user:${reactions.privateMessage.receiverId}`)
          .emit('remove-reactions', reactions);
      }
    } catch (error) {
      console.error(
        'Error removing reaction chat list:',
        error?.response?.message,
      );
      client.emit('error', {
        message: `Failed to remove reaction on chat list ${error?.response?.message}`,
      });
    }
  }

  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('pin-unpin')
  async unpin(client: Socket, payload: CreatePinUnpinMessageDto) {
    try {
      const { id, action, messageType } = payload;
      const senderId: number = client['user'].id;
      const is_pinned = action == 'Pin';
      if (messageType == ChatType.GroupMessage) {
        const reactions =
          await this.privateChatService.updateGroupMessageIsPinned(
            id,
            is_pinned,
          );
        this.server
          .to(`group:${reactions.groupId}`)
          .emit('pin-unpin-message', reactions);
        console.log({ reactions });
      }
      if (messageType == ChatType.PrivateMessage) {
        const reactions =
          await this.privateChatService.updatePrivateMessageIsPinned(
            id,
            is_pinned,
          );
        this.server
          .to(`user:${reactions.receiverId}`)
          .to(`user:${reactions.senderId}`)
          .emit('pin-unpin-message', reactions);
        console.log({ reactions });
      }
    } catch (error) {
      console.error(
        'Error on event pin unpin message fetching chat list:',
        error?.response?.message,
      );
      client.emit('error', {
        message: `Failed to pin message on chat list : ${error?.response?.message}`,
      });
    }
  }
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('delete')
  async deleteMessage(client: Socket, payload: CreateDeleteMessageDto) {
    try {
      const { id, messageType } = payload;
      const senderId: number = client['user'].id;

      if (ChatType.GroupMessage == messageType) {
        const message = await this.privateChatService.deleteGroupMessage(id);
        this.server
          .to(`group:${message.groupId}`)
          .emit('delete-message', message);
      }
      if (ChatType.PrivateMessage == messageType) {
        const message = await this.privateChatService.deleteMessage(id);
        this.server
          .to(`user:${message.receiverId}`)
          .to(`user:${message.senderId}`)
          .emit('delete-message', message);
      }
    } catch (error) {
      console.error(
        'Error deleting message on chat list:',
        error?.response?.message,
      );
      client.emit('error', {
        message: `Failed to Delete message on chat list :${error?.response?.message}`,
      });
    }
  }
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('seen')
  async messageSeen(client: Socket, payload: SetMessageSeenDto) {
    try {
      const senderId: number = client['user'].id;
      if (payload.messageType == ChatType.GroupMessage) {
        const message = await this.privateChatService.getGroupMessage(
          payload.id,
        );
        if (!message.is_seen) {
          const updatedMessage =
            await this.privateChatService.updateGroupMessageSeen(payload.id);
          this.server
            .to(`group:${message.groupId}`)
            .emit('message_seen', updatedMessage);
        }
      } else {
        const message = await this.privateChatService.getMessage(payload.id);
        if (!message.is_seen) {
          const updatedMessage =
            await this.privateChatService.updateMessageSeen(payload.id);

          this.server
            .to(`user:${message.receiverId}`)
            .to(`user:${message.senderId}`)
            .emit('message_seen', updatedMessage);
        }
      }
    } catch (error) {
      console.error('Error Seeing Message:', error?.response?.message);
      client.emit('error', {
        message: `Failed to set message seen :${error?.response?.message}`,
      });
    }
  }
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('forward')
  async forwardMessage(client: Socket, payload: CreateForwardMessageDto) {
    try {
      const sender: User = client['user'];
      const { messageId, messageType, groupId, receiverId } = payload;
      const isGroupMessage = messageType == ChatType.GroupMessage;
      const originalMessage = isGroupMessage
        ? await this.privateChatService.getGroupMessage(messageId)
        : await this.privateChatService.getMessage(messageId);
      console.log({ payload, isGroupMessage });
      console.log({ originalMessage });
      if (!originalMessage) {
        client.emit('error', {
          message: `Message  not find under ${messageType} Id : ${messageId}`,
        });
        return;
      }
      if (groupId) {
        const groupMessage =
          await this.privateChatService.forwardToGroupMessage(sender.id, {
            messageId,
            groupId,
            messageType,
          });
        console.log('Forward To Group Message', groupMessage);
        this.server
          .to(`group:${groupId}`)
          .emit('forward-message', groupMessage);
        return;
      }
      if (receiverId) {
        const privateMessage =
          await this.privateChatService.forwardToPrivateMessage(sender.id, {
            messageId,
            receiverId,
            messageType,
          });
        console.log('Forward To Private Message', privateMessage);
        this.server
          .to(`user:${receiverId}`)
          .emit('forward-message', privateMessage);
        return;
      }
      console.log(`message forwarded to`, payload);
    } catch (error) {
      console.error('Error forwarding  message:', error?.response?.message);
      client.emit('error', {
        message: `Failed to forward  message : ${error?.response?.message}`,
      });
    }
  }
}
