import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { MediaEntity } from './media.entity';
import { LikeEntity } from './like.entity';
import { CommentEntity } from './comment.entity';
import { ShareEntity } from './share.entity';
import { SaveEntity } from './save.entity';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column()
  user_id: string;

  @Column('text', { nullable: true })
  content: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => MediaEntity, (media) => media.post)
  media: MediaEntity[];  

  @OneToMany(() => LikeEntity, (like) => like.post) 
  likes: LikeEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @OneToMany(() => ShareEntity, (share) => share.post)
  shares: ShareEntity[];  

  @OneToMany(() => SaveEntity, (save) => save.post)
  saves: SaveEntity[];

  is_saved?: boolean;
}
