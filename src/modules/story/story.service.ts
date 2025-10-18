import { Injectable } from '@nestjs/common';
import { StoryRepository } from '@/repositories/story.repository';
import { FriendService } from '../friend/friend.service';
import { UserStoryDto } from './dto/userStory.dto';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly friendService: FriendService,
  ) {}

  async getStoriesByFriends(userId: string, page: number, limit: number): Promise<UserStoryDto[]> {
    const friends = await this.friendService.getAll(userId);
    const friendIds = friends.map(friend => friend.friend_id);
    
    if (friendIds.length === 0) {
      return [];
    }
    
    return await this.storyRepository.getLatestFriendsStories(friendIds, page, limit);
  }
}
