import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConversationEntity } from '@/entities/conversation.entity';

@Injectable()
export class ConversationRepository extends Repository<ConversationEntity> {
  constructor(private dataSource: DataSource) {
    super(ConversationEntity, dataSource.createEntityManager());
  }

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<ConversationEntity> {
    let conversation = await this.findOne({
      where: [
        { user1_id: user1Id, user2_id: user2Id },
        { user1_id: user2Id, user2_id: user1Id },
      ],
      relations: ['user1', 'user2'],
    });

    if (!conversation) {
      const [user1, user2] = [user1Id, user2Id].sort();
      conversation = this.create({
        user1_id: user1,
        user2_id: user2,
      });
      conversation = await this.save(conversation);
      
      conversation = await this.findOne({
        where: { id: conversation.id },
        relations: ['user1', 'user2'],
      });
    }

    return conversation;
  }

  async updateLastMessage(conversationId: string, messageId: string) {
    await this.update(
      { id: conversationId },
      {
        last_message_id: messageId,
      }
    );
  }

  async getConversationsByUserId(userId: string): Promise<ConversationEntity[]> {
    return await this
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .leftJoinAndSelect('conversation.last_message', 'last_message')
      .leftJoinAndSelect('last_message.sender', 'last_message_sender')
      .where('(conversation.user1_id = :userId OR conversation.user2_id = :userId)', { userId })
      .andWhere(
        `EXISTS (SELECT 1 FROM messages WHERE messages.conversation_id = conversation.id)`
      )
      .orderBy('last_message.created_at', 'DESC')
      .addOrderBy('conversation.created_at', 'DESC')
      .getMany();
  }

  async getConversationByUserIds(
    currentUserId: string,
    otherUserId: string,
  ): Promise<ConversationEntity | null> {
    return await this
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .leftJoinAndSelect('conversation.last_message', 'last_message')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'message_sender')
      .where('(conversation.user1_id = :currentUserId AND conversation.user2_id = :otherUserId) OR (conversation.user1_id = :otherUserId AND conversation.user2_id = :currentUserId)', {
        currentUserId,
        otherUserId,
      })
      .orderBy('messages.created_at', 'ASC')
      .getOne();
  }

  async getConversationById(conversationId: string): Promise<ConversationEntity | null> {
    return await this
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .leftJoinAndSelect('conversation.last_message', 'last_message')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'message_sender')
      .where('conversation.id = :conversationId', { conversationId })
      .orderBy('messages.created_at', 'ASC')
      .getOne();
  }
}

