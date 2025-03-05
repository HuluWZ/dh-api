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
  CreateGroupMessageDto,
  CreatePinUnpinMessageDto,
  CreatePrivateMessageDto,
  CreateReactionDto,
} from './dto/private.dto';
import { UseGuards } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';
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
  // Store userId and their corresponding socketId
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
        await this.redisService.setUserSocket(user.id, client.id); // Store socketId
        const groupIds = await this.orgGroupService.getMyGroups(user.id);
        groupIds.forEach((groupId) => {
          client.join(`group:${groupId}`);
          console.log(`User ${user.id} joined group ${groupId}`);
        });
        console.log(`Client connected:  ${user.id}, SocketId: ${client.id}`);
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

  // On client disconnect, remove their userId from the map
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user: User = client['user']; // Assuming the Auth Guard populates user
    if (user) {
      await this.redisService.removeUserSocket(user.id); // Remove on disconnect
      console.log(`User disconnected: ${user.id}, socketId: ${client.id}`);
    }
  }

  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreatePrivateMessageDto) {
    try {
      console.log(' Chat Payload ', payload, client['user']);
      console.log(' Sender Client ', client['user']);
      const sender: User = client['user'];
      // Create the message in the service layer
      const newMessage = await this.privateChatService.createPrivateMessage(
        sender.id,
        payload,
      );

      const receiverSocketId = await this.redisService.getUserSocket(
        payload.receiverId,
      );
      const senderSocketId = await this.redisService.getUserSocket(sender.id);

      // If the receiver is online, send the message to their socket
      if (payload.replyToId) {
        this.server.to(receiverSocketId).emit('replyMessage', newMessage);
      }
      console.log(`Message sent to user: ${payload.receiverId}`);
      this.server.to(receiverSocketId).emit('newMessage', newMessage);
      this.server.to(senderSocketId).emit('newMessage', newMessage);
      console.log(`Message sent to user: ${payload.receiverId}`);
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
      if (payload.replyToId) {
        this.server
          .to(`group:${payload.groupId}`)
          .emit('replyGroupMessage', groupMessage);
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

  // Handle fetching messages between two users (async handling)
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
      console.log({ messages });
      client.emit('messageHistory', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      console.log({ chatUsers });
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
          .to(`${reactions.privateMessage.receiverId}`)
          .emit('reactions', reactions);
      }
      console.log({ reactions });
    } catch (error) {
      console.error('Error fetching chat list:', error?.response?.message);
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
      console.log({ reactions });
      client.emit('remove-reactions', reactions);
    } catch (error) {
      console.error('Error fetching chat list:', error?.response?.message);
      client.emit('error', {
        message: `Failed to remove react on chat list ${error?.response?.message}`,
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
          .to(`group:${reactions.receiverId}`)
          .emit('pin-unpin-message', reactions);
        console.log({ reactions });
      }
    } catch (error) {
      console.error('Error fetching chat list:', error?.response?.message);
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
        this.server.to(`${message.receiverId}`).emit('delete-message', message);
      }
    } catch (error) {
      console.error('Error fetching chat list:', error?.response?.message);
      client.emit('error', {
        message: `Failed to Delete message on chat list :${error?.response?.message}`,
      });
    }
  }
}
