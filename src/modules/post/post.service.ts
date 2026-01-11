import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PostRepository } from '@/repositories/post.repository';
import { PostEntity } from '@/entities/post.entity';
import { FriendRepository } from '@/repositories/friend.repository';
import { MediaRepository } from '@/repositories/media.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Filter, MediaType } from '@/utils/constant';
import { MediaEntity } from '@/entities/media.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly friendRepository: FriendRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  async createPost(
    userId: string,
    content?: string,
    files?: Express.Multer.File[],
  ): Promise<PostEntity> {
    if (!content && (!files || files.length === 0)) {
      throw new BadRequestException('Post must have either content or images');
    }

    const post = this.postRepository.create({
      user_id: userId,
      content: content || null,
    });
    const savedPost = await this.postRepository.save(post);

    if (files && files.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadMultipleImages(files);
      
      const mediaEntities: MediaEntity[] = uploadResults.map((result, index) => {
        return this.mediaRepository.create({
          url: result.secure_url,
          type: MediaType.IMAGE,
          width: result.width,
          height: result.height,
          order: index,
          user_id: userId,
          post_id: savedPost.id,
          public_id: result.public_id,
        });
      });

      await this.mediaRepository.save(mediaEntities);
    }

    return this.getPostById(savedPost.id, userId);
  }

  async activatePost(postId: string, userId: string): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.is_active = true;
    await this.postRepository.save(post);
    
    return this.getPostById(postId, userId);
  }

  async deactivatePost(postId: string, userId: string): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.is_active = false;
    await this.postRepository.save(post);
    
    return this.getPostById(postId, userId);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['media'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user_id !== userId) {
      throw new BadRequestException('You can only delete your own posts');
    }

    if (post.media && post.media.length > 0) {
      const publicIds = post.media
        .map((media) => media.public_id)
        .filter((id) => id);

      if (publicIds.length > 0) {
        try {
          await this.cloudinaryService.deleteMultipleImages(publicIds);
        } catch (error) {
          console.error('Error deleting images from Cloudinary:', error);
        }
      }
    }

    await this.postRepository.remove(post);
  }
}
