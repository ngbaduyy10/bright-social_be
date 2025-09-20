import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { StoryType } from '@/utils/constant';

@Entity('stories')
export class StoryEntity extends BaseEntity {
  @Column()
  user_id: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: StoryType.TEXT })
  type: StoryType;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
