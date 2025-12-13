import { FriendRepository } from "./friend.repository";
import { PostRepository } from "./post.repository";
import { StoryRepository } from "./story.repository";
import { UserRepository } from "./user.repository";
import { MediaRepository } from "./media.repository";
import { SaveRepository } from "./save.repository";
import { NotificationRepository } from "./notification.repository";
import { ConversationRepository } from "./conversation.repository";
import { MessageRepository } from "./message.repository";
import { LikeRepository } from "./like.repository";
import { CommentRepository } from "./comment.repository";
import { AdminRepository } from "./admin.repository";

export const Repositories = [
  UserRepository,
  FriendRepository, 
  PostRepository,
  StoryRepository,
  MediaRepository,
  SaveRepository,
  NotificationRepository,
  ConversationRepository,
  MessageRepository,
  LikeRepository,
  CommentRepository,
  AdminRepository,
];