import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '@/utils/constant';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    nullable: true,
    unique: true,
  })
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

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at?: Date;
}
