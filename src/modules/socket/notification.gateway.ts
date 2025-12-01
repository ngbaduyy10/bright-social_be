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
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from '@/entities/notification.entity';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: '/notification',
  cors: { origin: true, credentials: true },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private notificationService: NotificationService,
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
      
      console.log(`User ${payload.id} connected to notifications`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  sendNotification(userId: string, notification: NotificationEntity) {
    this.server.to(`user:${userId}`).emit('new_notification', notification);
  }

  @SubscribeMessage('mark_notification_seen')
  async handleMarkNotificationSeen(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { success: false, message: 'User not found' };
    }

    try {
      await this.notificationService.markNotificationAsRead(data.notificationId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('mark_all_notifications_seen')
  async handleMarkAllNotificationsSeen(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    
    if (!userId) {
      return { success: false, message: 'User not found' };
    }

    try {
      await this.notificationService.markAllNotificationsAsRead(userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

