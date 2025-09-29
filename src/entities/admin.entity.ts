import { Column, Entity } from "typeorm";
import { BaseEntity } from '@/entities/base.entity';
import { AdminRole, Gender } from "@/utils/constant";

@Entity('admins')
export class AdminEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;
  
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true, type: 'enum', enum: Gender })
  gender: Gender;
  
  @Column({ nullable: true })
  last_name: string;

  @Column({ type: 'enum', enum: AdminRole })
  role: AdminRole;

  @Column({ nullable: true })
  image: string;
}