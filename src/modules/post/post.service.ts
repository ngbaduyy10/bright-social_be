import { Injectable } from '@nestjs/common';
import { PostRepository } from '@/repositories/post.repository';
import { FriendService } from '../friend/friend.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly friendService: FriendService,
  ) {}

  async getPostsByFriends(userId: string, page: number = 1, limit: number = 10) {
    const friends = await this.friendService.getAll(userId);
    const friendIds = friends.map(friend => friend.friend_id);
    if (friendIds.length === 0) {
      return [];
    }
    
    return await this.postRepository.getPostsByFriends(friendIds, page, limit);
  }
}
