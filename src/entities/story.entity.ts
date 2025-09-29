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
  url: string;

  @Column({ 
    type: 'enum', 
    enum: StoryType, 
    default: StoryType.TEXT 
  })
  type: StoryType;

  @Column({ nullable: true })
  background_color: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
