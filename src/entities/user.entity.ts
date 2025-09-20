import { Column, Entity } from 'typeorm';
import { Gender } from '@/utils/constant';
import { BaseEntity } from './base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
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

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  code_expired_at: Date;
}
