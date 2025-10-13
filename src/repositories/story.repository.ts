import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StoryEntity } from '@/entities/story.entity';

@Injectable()
export class StoryRepository extends Repository<StoryEntity> {
  constructor(private dataSource: DataSource) {
    super(StoryEntity, dataSource.createEntityManager());
  }

  async getStoriesByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    
    return await this
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.user', 'user')
      .where('story.user_id = :userId', { userId })
      .orderBy('story.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  async getLatestFriendIds(friendIds: string[], page: number, limit: number) {
    const offset = (page - 1) * limit;
    
    const latestFriends = await this
      .createQueryBuilder('story')
      .select('story.user_id', 'user_id')
      .addSelect('MAX(story.created_at)', 'latest_story_at')
      .where('story.user_id IN (:...friendIds)', { friendIds })
      .groupBy('story.user_id')
      .orderBy('latest_story_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getRawMany();

    const latestFriendIds = latestFriends.map(f => f.user_id);

    return latestFriendIds;
  }

  async getStoriesByFriendIds(friendIds: string[]) {
    if (friendIds.length === 0) {
      return [];
    }
    
    return await this
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.user', 'user')
      .where('story.user_id IN (:...friendIds)', { friendIds })
      .orderBy('story.created_at', 'DESC')
      .getMany();
  }

  async getLatestFriendsStories(friendIds: string[], page: number, limit: number) {
    const latestFriendIds = await this.getLatestFriendIds(friendIds, page, limit);
    const stories = await this.getStoriesByFriendIds(latestFriendIds);

    const storiesByUser = latestFriendIds.map(userId => ({
      user: stories.find(s => s.user_id === userId)?.user,
      stories: stories.filter(s => s.user_id === userId)
    }));

    return storiesByUser;
  }
}
