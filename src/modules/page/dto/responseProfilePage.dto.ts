import { UserEntity } from "@/entities/user.entity";
import { ConnectionType } from "@/utils/constant";

export class ResponseProfilePageDto extends UserEntity {
  total_friends: number;
  mutual?: number;
  connection_type?: ConnectionType;
}