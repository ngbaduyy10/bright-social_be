import { Column, Entity, OneToMany } from 'typeorm';
import { Gender } from '@/utils/constant';
import { BaseEntity } from './base.entity';
import { PostEntity } from './post.entity';
import { StoryEntity } from './story.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true, type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ default: false })
  is_verified: boolean;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => StoryEntity, (story) => story.user)
  stories: StoryEntity[];
}
