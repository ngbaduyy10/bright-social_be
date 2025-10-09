import { Injectable } from '@nestjs/common';
import { StoryRepository } from '@/repositories/story.repository';
import { FriendService } from '../friend/friend.service';
import { StoryEntity } from '@/entities/story.entity';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly friendService: FriendService,
  ) {}

  async getStoriesByFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<StoryEntity[]>> {
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
    
    const { stories, total } = await this.storyRepository.getStoriesByFriends(friendIds, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return { data: stories, meta };
  }
}
