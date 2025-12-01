import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MessageEntity } from '@/entities/message.entity';

@Injectable()
export class MessageRepository extends Repository<MessageEntity> {
  constructor(private dataSource: DataSource) {
    super(MessageEntity, dataSource.createEntityManager());
  }

  async markConversationAsSeen(conversationId: string, userId: string) {
    await this
      .createQueryBuilder()
      .update(MessageEntity)
      .set({
        is_seen: true,
        seen_at: () => 'CURRENT_TIMESTAMP',
      })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId })
      .andWhere('is_seen = false')
      .execute();
  }

  async markMessageAsSeen(messageId: string, userId: string) {
    await this.update(
      { id: messageId },
      {
        is_seen: true,
        seen_at: () => 'CURRENT_TIMESTAMP',
      }
    );
  }

  async getMessagesByConversationId(conversationId: string): Promise<MessageEntity[]> {
    return await this
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversation_id = :conversationId', { conversationId })
      .orderBy('message.created_at', 'ASC')
      .getMany();
  }
}

