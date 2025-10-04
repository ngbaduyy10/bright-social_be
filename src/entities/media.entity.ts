import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostEntity } from './post.entity';
import { MediaType } from '@/utils/constant';

@Entity('media')
export class MediaEntity extends BaseEntity {
  @Column()
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column()
  order: number;

  @Column()
  post_id: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;
}
