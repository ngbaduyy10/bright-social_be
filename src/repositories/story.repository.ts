import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StoryEntity } from '@/entities/story.entity';

@Injectable()
export class StoryRepository extends Repository<StoryEntity> {
  constructor(private dataSource: DataSource) {
    super(StoryEntity, dataSource.createEntityManager());
  }

  async getStoriesByFriends(friendIds: string[], page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const [stories, total] = await this
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.user', 'user')
      .where('story.user_id IN (:...friendIds)', { friendIds })
      .orderBy('story.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { stories, total };
  }

  async getStoriesByUser(userId: string, page: number = 1, limit: number = 10) {
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
}
