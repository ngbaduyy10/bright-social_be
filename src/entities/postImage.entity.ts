import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostEntity } from './post.entity';
import { ImageEntity } from './image.entity';

@Entity('post_images')
export class PostImageEntity extends BaseEntity {
  @Column()
  post_id: string;

  @Column()
  image_id: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @ManyToOne(() => ImageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: ImageEntity;
}
