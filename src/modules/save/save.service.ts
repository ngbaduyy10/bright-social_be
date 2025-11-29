import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SaveRepository } from '@/repositories/save.repository';
import { PostRepository } from '@/repositories/post.repository';
import { SaveEntity } from '@/entities/save.entity';

@Injectable()
export class SaveService {
  constructor(
    private readonly saveRepository: SaveRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async savePost(userId: string, postId: string): Promise<SaveEntity> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingSave = await this.saveRepository.findOne({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });
    if (existingSave) {
      throw new BadRequestException('Post already saved');
    }

    const save = this.saveRepository.create({
      user_id: userId,
      post_id: postId,
    });
    return await this.saveRepository.save(save);
  }

  async unsavePost(userId: string, postId: string): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingSave = await this.saveRepository.findOne({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });
    if (!existingSave) {
      throw new BadRequestException('Post is not saved');
    }

    await this.saveRepository.delete({
      user_id: userId,
      post_id: postId,
    });
    return { message: 'Post unsaved successfully' };
  }
}
