import { Controller, Post, Delete, Param, Request } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':postId')
  async likePost(
    @Param('postId') postId: string,
    @Request() req: { user: JwtUserDto },
  ) {
    return await this.likeService.likePost(postId, req.user.id);
  }

  @Delete(':postId')
  async unlikePost(
    @Param('postId') postId: string,
    @Request() req: { user: JwtUserDto },
  ) {
    return await this.likeService.unlikePost(postId, req.user.id);
  }
}
