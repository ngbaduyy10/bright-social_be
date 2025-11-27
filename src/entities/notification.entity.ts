import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { NotificationType } from '@/utils/constant';

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  user_id: string;

  @Column()
  actor_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;
}

