import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  user1_id: string;

  @Column({ type: 'uuid' })
  user2_id: string;

  @Column({ nullable: true, type: 'text' })
  last_message: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user1_id' })
  user1: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user2_id' })
  user2: UserEntity;

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];
}

