import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LikeRepository } from '@/repositories/like.repository';
import { PostRepository } from '@/repositories/post.repository';
import { NotificationRepository } from '@/repositories/notification.repository';
import { NotificationGateway } from '../socket/notification.gateway';
import { LikeEntity } from '@/entities/like.entity';
import { NotificationType } from '@/utils/constant';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly postRepository: PostRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async likePost(postId: string, userId: string): Promise<LikeEntity> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingLike) {
      throw new BadRequestException('Post already liked');
    }

    const like = this.likeRepository.create({
      post_id: postId,
      user_id: userId,
    });

    const savedLike = await this.likeRepository.save(like);

    if (post.user_id !== userId) {
      const notification = this.notificationRepository.create({
        type: NotificationType.LIKE,
        user_id: post.user_id,
        actor_id: userId,
        post_id: postId,
        is_seen: false,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      const notificationWithRelations = await this.notificationRepository.findOne({
        where: { id: savedNotification.id },
        relations: ['actor', 'post'],
      });

      if (notificationWithRelations) {
        this.notificationGateway.sendNotification(post.user_id, notificationWithRelations);
      }
    }

    return savedLike;
  }

  async unlikePost(postId: string, userId: string): Promise<LikeEntity> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (!existingLike) {
      throw new BadRequestException('Post not liked yet');
    }

    await this.likeRepository.remove(existingLike);

    return existingLike;
  }
}
