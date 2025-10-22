import { PostEntity } from "@/entities/post.entity";
import { UserEntity } from "@/entities/user.entity";

export class ResponseSearchPageDto {
  users: UserEntity[];
  posts: PostEntity[];
}