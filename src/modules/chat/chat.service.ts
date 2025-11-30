import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConversationRepository } from '@/repositories/conversation.repository';
import { MessageRepository } from '@/repositories/message.repository';
import { ConversationEntity } from '@/entities/conversation.entity';
import { MessageEntity } from '@/entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<ConversationEntity> {
    if (user1Id === user2Id) {
      throw new ForbiddenException('Cannot create conversation with yourself');
    }
    return await this.conversationRepository.getOrCreateConversation(user1Id, user2Id);
  }

  async getConversationById(conversationId: string, userId: string): Promise<ConversationEntity> {
    const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async createMessage(conversationId: string, senderId: string, content: string): Promise<MessageEntity> {
    const conversation = await this.conversationRepository.getConversationById(conversationId, senderId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = this.messageRepository.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content,
      is_seen: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.updateLastMessage(conversationId, content);

    return await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });
  }

  async markConversationAsSeen(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.messageRepository.markConversationAsSeen(conversationId, userId);
  }

  async markMessageAsSeen(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const conversation = await this.conversationRepository.getConversationById(
      message.conversation_id,
      userId
    );

    if (!conversation) {
      throw new ForbiddenException('Access denied');
    }

    await this.messageRepository.markMessageAsSeen(messageId, userId);
    
    return message;
  }
}

