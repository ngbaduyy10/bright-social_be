import { Column, Entity } from "typeorm";
import { BaseEntity } from '@/entities/base.entity';
import { AdminRole, Gender } from "@/utils/constant";

@Entity('admins')
export class AdminEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;
  
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  gender: Gender;
  
  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  role: AdminRole;

  @Column({ nullable: true })
  image: string;
}