import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { NotificationGateway } from './notification.gateway';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [JwtModule, ChatModule, NotificationModule],
  providers: [ChatGateway, NotificationGateway],
  exports: [ChatGateway, NotificationGateway],
})
export class SocketModule {}

