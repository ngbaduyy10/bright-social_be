import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

@Entity('friends')
export class FriendEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  user1_id: string;

  @Column({ type: 'uuid' })
  user2_id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user1_id' })
  user1: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user2_id' })
  user2: UserEntity;
}