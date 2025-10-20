import { Injectable } from '@nestjs/common';
import { PostRepository } from '@/repositories/post.repository';
import { PostEntity } from '@/entities/post.entity';
import { FriendRepository } from '@/repositories/friend.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly friendRepository: FriendRepository,
  ) {}

  async getPostsByFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<PostEntity[]>> {
    const friends = await this.friendRepository.getAll(userId);
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

  async getSavedPosts(userId: string, page: number, limit: number, order?: 'ASC' | 'DESC'): Promise<PaginatedResponse<PostEntity[]>> {
    const { posts, total } = await this.postRepository.getSavedPostsByUser(userId, page, limit, order);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: posts, meta };
  }

  async getPostsByUser(userId: string, page: number, limit: number): Promise<PaginatedResponse<PostEntity[]>> {
    const { posts, total } = await this.postRepository.getPostsByUser(userId, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return { data: posts, meta };
  }
}
