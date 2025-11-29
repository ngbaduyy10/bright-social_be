import { Injectable } from '@nestjs/common';
import { PostService } from '../post/post.service';
import { StoryService } from '../story/story.service';
import { UserService } from '../user/user.service';
import { ResponseNewsFeedPageDto } from './dto/responseNewsFeedPage.dto';
import { ResponseSearchPageDto } from './dto/responseSearchPage.dto';
import { PostRepository } from '@/repositories/post.repository';
import { StoryRepository } from '@/repositories/story.repository';
import { MediaRepository } from '@/repositories/media.repository';
import { UserRepository } from '@/repositories/user.repository';
import { FriendRepository } from '@/repositories/friend.repository';
import { ResponseProfilePageDto } from './dto/responseProfilePage.dto';
import { ConnectionType } from '@/utils/constant';

@Injectable()
export class PageService {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly storyService: StoryService,
    private readonly postRepository: PostRepository,
    private readonly storyRepository: StoryRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly userRepository: UserRepository,
    private readonly friendRepository: FriendRepository,
  ) {}

  async getNewsFeedPage(userId: string, storyLimit: number, postLimit: number): Promise<ResponseNewsFeedPageDto> {
    const { data: posts } = await this.postService.getPostsByFriends(userId, 1, postLimit);
    const stories = await this.storyService.getStoriesByFriends(userId, 1, storyLimit);
    return {
      posts,
      stories,
    };
  }

  async getProfilePage(currentUserId: string, username: string, postLimit: number, storyLimit: number, mediaLimit: number): Promise<ResponseProfilePageDto> {
    const user = await this.userService.findOneByUsername(username);
    const { posts } = await this.postRepository.getPostsByUser(user.id, 1, postLimit, currentUserId);
    const { stories } = await this.storyRepository.getStoriesByUser(user.id, 1, storyLimit);
    const { media } = await this.mediaRepository.getMediaByUser(user.id, 1, mediaLimit);
    
    const totalFriends = await this.friendRepository.getTotalFriendsCount(user.id);
    
    let mutual: number | undefined;
    let connectionType: ConnectionType | null = null;
    if (currentUserId !== user.id) {
      mutual = await this.friendRepository.getMutualFriendsCount(currentUserId, user.id);
      connectionType = await this.friendRepository.getConnectionType(currentUserId, user.id);
    }
    
    return {
      ...user,
      posts,
      stories,
      media,
      total_friends: totalFriends,
      ...(mutual !== undefined && { mutual }),
      ...(connectionType !== null && { connection_type: connectionType }),
    };
  }

  async getSearchPage(keyword: string, userLimit: number, postLimit: number, currentUserId: string): Promise<ResponseSearchPageDto> {
    const { users } = await this.userRepository.getAllUsers({ keyword, limit: userLimit, page: 1 });
    const { posts } = await this.postRepository.getAllPosts({ keyword, limit: postLimit, page: 1 }, currentUserId);
    return {
      users,
      posts,
    };
  }
}
