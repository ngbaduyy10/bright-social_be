import { Controller, Get, Query, Request } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { PostEntity } from '@/entities/post.entity';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPostsByFriends(
    @Request() req: { user: JwtUserDto }, 
    @Query('page') page: number, 
    @Query('limit') limit: number
  ): Promise<PaginatedResponse<PostEntity[]>> {
    return await this.postService.getPostsByFriends(req.user.id, page, limit);
  }
}
