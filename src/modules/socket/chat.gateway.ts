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
      await this.chatService.getConversationById(data.conversationId, userId);
      
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

      const conversation = await this.chatService.getConversationById(data.conversationId, userId);
      const receiverId = conversation.user1_id === userId 
        ? conversation.user2_id 
        : conversation.user1_id;

      const messageResponse = {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        is_seen: message.is_seen,
        seen_at: message.seen_at,
        created_at: message.created_at,
        sender: message.sender ? {
          id: message.sender.id,
          username: message.sender.username,
          first_name: message.sender.first_name,
          last_name: message.sender.last_name,
          image: message.sender.image,
        } : undefined,
      };

      this.server.to(`user:${receiverId}`).emit('message_received', messageResponse);
      
      client.emit('message_received', messageResponse);

      this.server.to(`user:${receiverId}`).emit('conversation_updated', {
        id: conversation.id,
        last_message: conversation.last_message,
        last_message_at: conversation.last_message_at,
      });
      client.emit('conversation_updated', {
        id: conversation.id,
        last_message: conversation.last_message,
        last_message_at: conversation.last_message_at,
      });

      return { success: true, message: messageResponse };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('mark_seen')
  async handleMarkSeen(
    @MessageBody() data: { conversationId?: string; messageId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { success: false, message: 'User not found' };
    }

    try {
      if (data.conversationId) {
        await this.chatService.markConversationAsSeen(data.conversationId, userId);
        
        const conversation = await this.chatService.getConversationById(data.conversationId, userId);
        const senderId = conversation.user1_id === userId 
          ? conversation.user2_id 
          : conversation.user1_id;

        this.server.to(`user:${senderId}`).emit('message_seen', {
          conversationId: data.conversationId,
        });
      } else if (data.messageId) {
        const message = await this.chatService.markMessageAsSeen(data.messageId, userId);
        
        if (message) {
          const conversation = await this.chatService.getConversationById(
            message.conversation_id,
            userId
          );
          const senderId = conversation.user1_id === userId 
            ? conversation.user2_id 
            : conversation.user1_id;

          this.server.to(`user:${senderId}`).emit('message_seen', {
            messageId: data.messageId,
            conversationId: message.conversation_id,
          });
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

