import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { NotificationType } from '@/utils/constant';
import { PostEntity } from './post.entity';

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  user_id: string;

  @Column()
  actor_id: string;

  @Column({ nullable: true })
  post_id?: string;

  @Column({ default: false })
  is_seen: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  seen_at: Date;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;
}

