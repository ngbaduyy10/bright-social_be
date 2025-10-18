import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PostEntity } from '@/entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
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
    
    return await this
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.shares', 'shares')
      .leftJoinAndSelect('post.saves', 'saves')
      .where('post.user_id = :userId', { userId })
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
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
