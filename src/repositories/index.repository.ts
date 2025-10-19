import { FriendRepository } from "./friend.repository";
import { PostRepository } from "./post.repository";
import { StoryRepository } from "./story.repository";
import { UserRepository } from "./user.repository";
import { MediaRepository } from "./media.repository";

export const Repositories = [
  UserRepository,
  FriendRepository, 
  PostRepository,
  StoryRepository,
  MediaRepository,
];