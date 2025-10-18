import { PostEntity } from "@/entities/post.entity";
import { UserStoryDto } from "@/modules/story/dto/userStory.dto";

export class ResponseNewsFeedPageDto {
  posts: PostEntity[];
  stories: UserStoryDto[];
}