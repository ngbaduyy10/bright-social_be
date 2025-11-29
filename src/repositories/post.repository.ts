import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Filter } from '@/utils/constant';
import { PostEntity } from '@/entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  private applyCommonJoins(queryBuilder: SelectQueryBuilder<PostEntity>): SelectQueryBuilder<PostEntity> {
    queryBuilder
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('post.shares', 'shares')
      .leftJoinAndSelect('post.saves', 'saves');
    return queryBuilder;
  }

  private setSavedStatus(posts: PostEntity[], userId?: string | null, forceSaved: boolean = false): void {
    posts.forEach(post => {
      if (forceSaved) {
        post.is_saved = true;
      } else if (userId) {
        post.is_saved = post.saves?.some(save => save.user_id === userId) || false;
      } else {
        post.is_saved = false;
      }
    });
  }

  async getAllPosts(filter: Filter, userId: string) {
    const offset = (filter.page - 1) * filter.limit;
    const query = this.applyCommonJoins(this.createQueryBuilder('post'));

    if (filter.keyword) {
      query.where('LOWER(post.content) LIKE :keyword', { 
        keyword: `%${filter.keyword.toLowerCase()}%` 
      });
    }

    query.skip(offset).take(filter.limit);

    const [posts, total] = await query.getManyAndCount();
    this.setSavedStatus(posts, userId);
    
    return { posts, total };
  }

  async getPostsByFriends(friendIds: string[], page: number, limit: number, currentUserId: string) {
    const offset = (page - 1) * limit;
    
    const query = this.applyCommonJoins(this.createQueryBuilder('post'))
      .where('post.user_id IN (:...friendIds)', { friendIds })
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit);
    
    const [posts, total] = await query.getManyAndCount();
    this.setSavedStatus(posts, currentUserId);
    
    return { posts, total };
  }

  async getPostsByUser(userId: string, page: number, limit: number, currentUserId: string) {
    const offset = (page - 1) * limit;
    
    const query = this.applyCommonJoins(this.createQueryBuilder('post'))
      .where('post.user_id = :userId', { userId })
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit);
    
    const [posts, total] = await query.getManyAndCount();
    this.setSavedStatus(posts, currentUserId);
    
    return { posts, total };
  }

  async getSavedPostsByUser(userId: string, page: number, limit: number, order: 'ASC' | 'DESC' = 'DESC') {
    const offset = (page - 1) * limit;
    
    const query = this.applyCommonJoins(this.createQueryBuilder('post'))
      .innerJoinAndSelect('post.saves', 'save', 'save.user_id = :userId', { userId })
      .orderBy('save.created_at', order)
      .skip(offset)
      .take(limit);
    
    const [posts, total] = await query.getManyAndCount();
    this.setSavedStatus(posts, null, true);
    
    return { posts, total };
  }
}
