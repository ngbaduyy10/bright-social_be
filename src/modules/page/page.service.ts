import { Injectable } from '@nestjs/common';
import { PostService } from '../post/post.service';
import { StoryService } from '../story/story.service';
import { UserService } from '../user/user.service';
import { ResponseNewsFeedPageDto } from './dto/responseNewsFeedPage.dto';
import { ResponseSearchPageDto } from './dto/responseSearchPage.dto';
import { PostRepository } from '@/repositories/post.repository';
import { StoryRepository } from '@/repositories/story.repository';
import { UserEntity } from '@/entities/user.entity';
import { MediaRepository } from '@/repositories/media.repository';
import { UserRepository } from '@/repositories/user.repository';

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
  ) {}

  async getNewsFeedPage(userId: string, storyLimit: number, postLimit: number): Promise<ResponseNewsFeedPageDto> {
    const { data: posts } = await this.postService.getPostsByFriends(userId, 1, postLimit);
    const stories = await this.storyService.getStoriesByFriends(userId, 1, storyLimit);
    return {
      posts,
      stories,
    };
  }

  async getProfilePage(username: string, postLimit: number, storyLimit: number, mediaLimit: number): Promise<UserEntity> {
    const user = await this.userService.findOneByUsername(username);
    const { posts } = await this.postRepository.getPostsByUser(user.id, 1, postLimit);
    const { stories } = await this.storyRepository.getStoriesByUser(user.id, 1, storyLimit);
    const { media } = await this.mediaRepository.getMediaByUser(user.id, 1, mediaLimit);
    
    return {
      ...user,
      posts,
      stories,
      media,
    };
  }

  async getSearchPage(keyword: string, userLimit: number, postLimit: number): Promise<ResponseSearchPageDto> {
    const { users } = await this.userRepository.getAllUsers({ keyword, limit: userLimit, page: 1 });
    const { posts } = await this.postRepository.getAllPosts({ keyword, limit: postLimit, page: 1 });
    return {
      users,
      posts,
    };
  }
}
