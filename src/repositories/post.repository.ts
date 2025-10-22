import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Filter } from '@/utils/constant';
import { PostEntity } from '@/entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async getAllPosts(filter: Filter) {
    const offset = (filter.page - 1) * filter.limit;
    const query = this
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('post.media', 'media')
    .leftJoinAndSelect('post.likes', 'likes')
    .leftJoinAndSelect('post.comments', 'comments')
    .leftJoinAndSelect('post.shares', 'shares')

    if (filter.keyword) {
      query.where(`
        LOWER(post.content) LIKE :keyword
      `, { keyword: `%${filter.keyword.toLowerCase()}%` });
    }

    query.skip(offset).take(filter.limit);

    const [posts, total] = await query.getManyAndCount();
    return { posts, total };
  }

  async getPostsByFriends(friendIds: string[], page: number, limit: number) {
    const offset = (page - 1) * limit;
    
    const [posts, total] = await this
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.shares', 'shares')
      .leftJoinAndSelect('post.saves', 'saves')
      .where('post.user_id IN (:...friendIds)', { friendIds })
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    
    return { posts, total };
  }

  async getPostsByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    
    const [posts, total] = await this
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.shares', 'shares')
      .leftJoinAndSelect('post.saves', 'saves')
      .where('post.user_id = :userId', { userId })
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    
    return { posts, total };
  }

  async getSavedPostsByUser(userId: string, page: number, limit: number, order: 'ASC' | 'DESC' = 'DESC') {
    const offset = (page - 1) * limit;
    
    const [posts, total] = await this
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.saves', 'save', 'save.user_id = :userId', { userId })
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.shares', 'shares')
      .orderBy('save.created_at', order)
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    
    return { posts, total };
  }
}
