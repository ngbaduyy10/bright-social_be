import { Controller, Get, Param, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { ConversationEntity } from '@/entities/conversation.entity';
import { MessageEntity } from '@/entities/message.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation')
  async getConversations(
    @Request() req: { user: JwtUserDto },
  ): Promise<ConversationEntity[]> {
    return await this.chatService.getConversationsByUserId(req.user.id);
  }

  @Get('conversation/:userId')
  async getConversationByUserId(
    @Param('userId') userId: string,
    @Request() req: { user: JwtUserDto },
  ): Promise<ConversationEntity> {
    return await this.chatService.getConversationByUserId(userId, req.user.id);
  }

  @Get('message/:userId')
  async getMessages(
    @Param('userId') userId: string,
    @Request() req: { user: JwtUserDto },
  ): Promise<MessageEntity[]> {
    return await this.chatService.getMessagesByUserId(userId, req.user.id);
  }
}

