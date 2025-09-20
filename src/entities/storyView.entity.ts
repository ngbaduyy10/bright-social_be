import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { StoryEntity } from './story.entity';

@Entity('story_views')
export class StoryViewEntity extends BaseEntity {
  @Column()
  story_id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => StoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: StoryEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
