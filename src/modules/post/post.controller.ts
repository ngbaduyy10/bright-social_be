import { Controller, Get, Query, Request } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getPostsByFriends(
    @Request() req: { user: JwtUserDto }, 
    @Query('page') page: number, 
    @Query('limit') limit: number
  ) {
    return this.postService.getPostsByFriends(req.user.id, page, limit);
  }
}
