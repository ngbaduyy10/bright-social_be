import { Controller, Post, Param, Body, Request } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':postId')
  async createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: JwtUserDto },
  ) {
    return await this.commentService.createComment(postId, req.user.id, createCommentDto);
  }
}
