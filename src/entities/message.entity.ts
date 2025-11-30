import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from './user.entity';

@Entity('messages')
export class MessageEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  conversation_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  is_seen: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  seen_at: Date;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;
}

