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
  CreateGroupMessageDto,
  CreatePrivateMessageDto,
} from './dto/private.dto';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
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
      client.handshake.auth.token?.split(' ')[1] ??
      (client.handshake.query.token as string).split(' ')[1];
    if (!token) {
      client.emit('error', { message: 'Please provide token' });
    }
    console.log({ token });
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
      const sender: User = client['user'];
      // Create the message in the service layer
      const newMessage = await this.privateChatService.createPrivateMessage(
        sender.id,
        payload,
      );

      const receiverSocketId = await this.redisService.getUserSocket(
        payload.receiverId,
      );
      // If the receiver is online, send the message to their socket
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', newMessage);
        console.log(`Message sent to user: ${payload.receiverId}`);
      } else {
        console.log(
          `User ${payload.receiverId} is offline, message saved to DB`,
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
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
      this.server
        .to(`group:${payload.groupId}`)
        .emit('newGroupMessage', groupMessage);
      console.log(
        `Group message sent to group ${payload.groupId} from ${sender.firstName} ${sender.middleName}.`,
      );
    } catch (error) {
      console.error('Error sending group message:', error);
      client.emit('error', { message: 'Failed to send group message' });
    }
  }

  // Handle fetching messages between two users (async handling)
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('findMessages')
  async handleFindMessages(client: Socket, payload: { receiverId: number }) {
    try {
      const senderId: number = client['user'].id;
      const messages = await this.privateChatService.findMessages(
        senderId,
        payload.receiverId,
      );

      client.emit('messageHistory', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      client.emit('error', { message: 'Failed to fetch messages' });
    }
  }

  // Handle fetching the list of users the authenticated user has chatted with
  @UseGuards(PrivateChatGuard)
  @SubscribeMessage('getMyChats')
  async handleGetMyChats(client: Socket) {
    try {
      const senderId: number = client['user'].id;
      const chatUsers = await this.privateChatService.getMyChats(senderId);
      client.emit('myChats', chatUsers);
    } catch (error) {
      console.error('Error fetching chat list:', error);
      client.emit('error', { message: 'Failed to fetch chat list' });
    }
  }
}
