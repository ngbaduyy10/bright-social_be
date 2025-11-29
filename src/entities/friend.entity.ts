import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";
import { FriendStatus } from "@/utils/constant";

@Entity('friends')
export class FriendEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  friend_id: string;

  @Column({ 
    type: 'enum', 
    enum: FriendStatus, 
    default: FriendStatus.PENDING 
  })
  status: FriendStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'friend_id' })
  friend: UserEntity;

  mutual?: number;
}