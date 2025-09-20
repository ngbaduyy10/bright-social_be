import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";
import { FriendRequestStatus } from "@/utils/constant";

@Entity('friend_requests')
export class FriendRequestEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  requester_id: string;

  @Column({ type: 'uuid' })
  receiver_id: string;

  @Column({ default: FriendRequestStatus.PENDING })
  status: FriendRequestStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'requester_id' })
  requester: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserEntity;
}
