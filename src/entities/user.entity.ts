import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({
    nullable: true,
    unique: true,
  })
  phone: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  code_id: string;

  @Column({ nullable: true })
  code_expiration: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at?: Date;
}
