import { Injectable } from '@nestjs/common';
import { PostService } from '../post/post.service';
import { StoryService } from '../story/story.service';
import { UserService } from '../user/user.service';
import { ResponseNewsFeedPageDto } from './dto/responseNewsFeedPage.dto';
import { PostRepository } from '@/repositories/post.repository';
import { StoryRepository } from '@/repositories/story.repository';
import { UserEntity } from '@/entities/user.entity';

@Injectable()
export class PageService {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly storyService: StoryService,
    private readonly postRepository: PostRepository,
    private readonly storyRepository: StoryRepository,
  ) {}

  async getNewsFeedPage(userId: string, storyLimit: number, postLimit: number): Promise<ResponseNewsFeedPageDto> {
    const { data: posts } = await this.postService.getPostsByFriends(userId, 1, postLimit);
    const stories = await this.storyService.getStoriesByFriends(userId, 1, storyLimit);
    return {
      posts,
      stories,
    };
  }

  async getProfilePage(username: string, postLimit: number, storyLimit: number): Promise<UserEntity> {
    const user = await this.userService.findOneByUsername(username);
    const { posts } = await this.postRepository.getPostsByUser(user.id, 1, postLimit);
    const { stories } = await this.storyRepository.getStoriesByUser(user.id, 1, storyLimit);
    return {
      ...user,
      posts,
      stories,
    };
  }
}
