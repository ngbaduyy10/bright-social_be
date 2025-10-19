import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostEntity } from './post.entity';
import { MediaType } from '@/utils/constant';
import { UserEntity } from './user.entity';

@Entity('media')
export class MediaEntity extends BaseEntity {
  @Column()
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column()
  order: number;

  @Column()
  user_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  post_id: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;
}
