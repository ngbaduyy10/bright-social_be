import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '@/repositories/post.repository';
import { PostEntity } from '@/entities/post.entity';
import { FriendRepository } from '@/repositories/friend.repository';
import { Filter } from '@/utils/constant';
import { CreatePostDto } from './dto/create-post.dto';
import { MediaRepository } from '@/repositories/media.repository';
import { MediaEntity } from '@/entities/media.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly friendRepository: FriendRepository,
    private readonly mediaRepository: MediaRepository,
  ) { }

  async create(createPostDto: CreatePostDto, userId: string): Promise<PostEntity> {
    const { content, media } = createPostDto;

    const post = new PostEntity();
    post.user_id = userId;
    post.content = content;

    const savedPost = await this.postRepository.save(post);

    if (media && media.length > 0) {
      const mediaEntities = media.map((m, index) => {
        const mediaEntity = new MediaEntity();
        mediaEntity.post_id = savedPost.id;
        mediaEntity.user_id = userId;
        mediaEntity.url = m.url;
        mediaEntity.type = m.type;
        mediaEntity.width = m.width;
        mediaEntity.height = m.height;
        mediaEntity.order = index;
        return mediaEntity;
      });

      await this.mediaRepository.save(mediaEntities);
    }

    return this.getPostById(savedPost.id, userId);
  }

  async findAll(filter: Filter, userId: string): Promise<PaginatedResponse<PostEntity[]>> {
    const { posts, total } = await this.postRepository.getAllPosts(filter, userId);
    const meta: PaginationMeta = {
      page: filter.page,
      limit: filter.limit,
      total,
      totalPages: Math.ceil(total / filter.limit),
    };

    return { data: posts, meta };
  }

  async getPostById(id: string, userId: string): Promise<PostEntity> {
    const post = await this.postRepository.findOne({ where: { id }, relations: ['user', 'media', 'likes', 'comments', 'comments.user', 'shares', 'saves'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userId && post.saves) {
      post.is_saved = post.saves.some(save => save.user_id === userId);
    } else {
      post.is_saved = false;
    }

    if (userId && post.likes) {
      post.is_liked = post.likes.some(like => like.user_id === userId);
    } else {
      post.is_liked = false;
    }

    return post;
  }

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

    const { posts, total } = await this.postRepository.getPostsByFriends(friendIds, page, limit, userId);
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

  async getPostsByUser(userId: string, page: number, limit: number, currentUserId: string): Promise<PaginatedResponse<PostEntity[]>> {
    const { posts, total } = await this.postRepository.getPostsByUser(userId, page, limit, currentUserId);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return { data: posts, meta };
  }
}
