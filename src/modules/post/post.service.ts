import { Injectable } from '@nestjs/common';
import { PostRepository } from '@/repositories/post.repository';
import { FriendService } from '../friend/friend.service';
import { PostEntity } from '@/entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly friendService: FriendService,
  ) {}

  async getPostsByFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<PostEntity[]>> {
    const friends = await this.friendService.getAll(userId);
    const friendIds = friends.map(friend => friend.friend_id);
    
    if (friendIds.length === 0) {
      const meta: PaginationMeta = {
        page,
        limit,
        total: 0,
        totalPages: 0,
      };
      return { data: [], meta };
    }
    
    const { posts, total } = await this.postRepository.getPostsByFriends(friendIds, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: posts, meta };
  }
}
