import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat/chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      
      this.connectedUsers.set(client.id, payload.id);
      client.join(`user:${payload.id}`);
      
      console.log(`User ${payload.id} connected to chat`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { success: false, message: 'User not found' };
    }

    try {
      await this.chatService.getConversationById(data.conversationId);
      
      client.join(`conversation:${data.conversationId}`);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { success: false, message: 'User not found' };
    }

    try {
      const message = await this.chatService.createMessage(
        data.conversationId,
        userId,
        data.content,
      );

      const conversation = await this.chatService.getConversationById(data.conversationId);
      const receiverId = conversation.user1_id === userId 
        ? conversation.user2_id 
        : conversation.user1_id;

      this.server.to(`user:${receiverId}`).emit('message_received', message);
      client.emit('message_received', message);

      this.server.to(`user:${receiverId}`).emit('conversation_updated', conversation);
      client.emit('conversation_updated', conversation);

      return { success: true, message: message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('mark_seen')
  async handleMarkSeen(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { success: false, message: 'User not found' };
    }

    try {
      await this.chatService.markConversationAsSeen(data.conversationId, userId);
        
      const conversation = await this.chatService.getConversationById(data.conversationId);
      const senderId = conversation.user1_id === userId 
        ? conversation.user2_id 
        : conversation.user1_id;

      this.server.to(`user:${senderId}`).emit('message_seen', conversation);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

