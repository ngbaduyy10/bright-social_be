export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum StoryType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface Filter {
  keyword?: string;
  limit: number;
  page: number;
}

export enum NotificationType {
  LIKE = 'like',
  SHARE = 'share',
  COMMENT = 'comment',
  ADD_FRIEND = 'add_friend',
  ACCEPT_FRIEND = 'accept_friend',
}