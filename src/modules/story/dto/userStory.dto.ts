import { UserEntity } from "@/entities/user.entity";
import { StoryEntity } from "@/entities/story.entity";

export class UserStoryDto {
  user: UserEntity;
  stories: StoryEntity[];
}