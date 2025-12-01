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

  async getConversationById(conversationId: string): Promise<ConversationEntity> {
    const conversation = await this.conversationRepository.getConversationById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async createMessage(conversationId: string, senderId: string, content: string): Promise<MessageEntity> {
    const conversation = await this.conversationRepository.getConversationById(conversationId);
    
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

    await this.conversationRepository.updateLastMessage(conversationId, savedMessage.id);

    return await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });
  }

  async markConversationAsSeen(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.getConversationById(conversationId);
    
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

    const conversation = await this.conversationRepository.getConversationById(message.conversation_id);

    if (!conversation) {
      throw new ForbiddenException('Access denied');
    }

    await this.messageRepository.markMessageAsSeen(messageId, userId);
    
    return message;
  }

  async getConversationsByUserId(userId: string): Promise<ConversationEntity[]> {
    return await this.conversationRepository.getConversationsByUserId(userId);
  }

  async getMessagesByConversationId(
    conversationId: string,
    userId: string,
  ): Promise<MessageEntity[]> {
    const conversation = await this.conversationRepository.getConversationById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return await this.messageRepository.getMessagesByConversationId(conversationId);
  }

  async getConversationByUserId(
    otherUserId: string,
    currentUserId: string,
  ): Promise<ConversationEntity> {
    let conversation = await this.conversationRepository.getConversationByUserIds(
      currentUserId,
      otherUserId,
    );

    if (!conversation) {
      conversation = await this.conversationRepository.getOrCreateConversation(currentUserId, otherUserId);
      conversation = await this.conversationRepository.getConversationById(conversation.id);
    }

    return conversation;
  }

  async getMessagesByUserId(
    otherUserId: string,
    currentUserId: string,
  ): Promise<MessageEntity[]> {
    const conversation = await this.conversationRepository.findOne({
      where: [
        { user1_id: currentUserId, user2_id: otherUserId },
        { user1_id: otherUserId, user2_id: currentUserId },
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return await this.messageRepository.getMessagesByConversationId(conversation.id);
  }
}

