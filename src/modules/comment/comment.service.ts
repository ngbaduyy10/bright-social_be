import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '@/repositories/comment.repository';
import { PostRepository } from '@/repositories/post.repository';
import { NotificationRepository } from '@/repositories/notification.repository';
import { NotificationGateway } from '../socket/notification.gateway';
import { CommentEntity } from '@/entities/comment.entity';
import { NotificationType } from '@/utils/constant';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      post_id: postId,
      user_id: userId,
      content: createCommentDto.content,
    });

    const savedComment = await this.commentRepository.save(comment);

    if (post.user_id !== userId) {
      const notification = this.notificationRepository.create({
        type: NotificationType.COMMENT,
        user_id: post.user_id,
        actor_id: userId,
        post_id: postId,
        is_seen: false,
        content: createCommentDto.content,
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

    return await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'post'],
    });
  }
}
