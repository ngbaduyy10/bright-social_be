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

  async getConversationById(conversationId: string, userId: string): Promise<ConversationEntity | null> {
    return await this.findOne({
      where: [
        { id: conversationId, user1_id: userId },
        { id: conversationId, user2_id: userId },
      ],
      relations: ['user1', 'user2'],
    });
  }

  async updateLastMessage(conversationId: string, lastMessage: string) {
    await this.update(
      { id: conversationId },
      {
        last_message: lastMessage,
        last_message_at: () => 'CURRENT_TIMESTAMP',
      }
    );
  }
}

