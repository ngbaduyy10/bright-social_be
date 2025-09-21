import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostEntity } from './post.entity';

@Entity('images')
export class ImageEntity extends BaseEntity {
  @Column()
  url: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  post_id: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;
}
