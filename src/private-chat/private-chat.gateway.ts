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
import { CreatePrivateMessageDto } from './dto/private.dto';
// import { WsJwtAuthGuard } from './private-chat.guard';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
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
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  // @UseGuards(WsJwtAuthGuard) // Use WebSocket JWT Guard to get user details
  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth.token?.split(' ')[1];
    const decoded: { sub: number; phone: string } =
      this.jwtService.verify(token);
    if (!decoded) {
      throw new UnauthorizedException('Unauthorized Access');
    }
    const { sub, phone } = decoded;
    const user = { id: sub, phone }; // Create a new object with id and phone
    client['user'] = user;
    const userId: number = client['user'].id; // Extract userId from Auth Guard
    this.userSocketMap.set(userId, client.id); // Store the mapping of userId to socketId
    console.log(`Client connected:  ${userId}, SocketId: ${client.id}`);
  }

  // On client disconnect, remove their userId from the map
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId: number = client['user'].id; // Extract userId from Auth Guard
    this.userSocketMap.delete(userId); // Remove the user from the map
    console.log(`User disconnected: ${userId}, socketId: ${client.id}`);
  }

  // Handle sending a new message (async handling with senderId from authenticated user)
  // Send a private message to a user
  // @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreatePrivateMessageDto) {
    try {
      // Extract the authenticated user's ID from the client object
      const senderId: number = client['user'].id;
      console.log({ payload });
      // Create the message in the service layer
      const newMessage = await this.privateChatService.createPrivateMessage(
        senderId,
        payload,
      );

      const receiverSocketId = this.userSocketMap.get(payload.receiverId);

      // If the receiver is online, send the message to their socket
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', newMessage);
        console.log(`Message sent to user: ${payload.receiverId}`);
      } else {
        console.log(
          `User ${payload.receiverId} is offline, message saved to DB`,
        );
      }

      // Also send the message back to the sender to confirm it's sent
      // client.emit('newMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // Handle fetching messages between two users (async handling)
  // @UseGuards(WsJwtAuthGuard)
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
  // @UseGuards(WsJwtAuthGuard)
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
