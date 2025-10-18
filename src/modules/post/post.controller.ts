import { Controller, Get, Param, Query, Request } from '@nestjs/common';
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

  @Get('saved')
  async getSavedPosts(
    @Request() req: { user: JwtUserDto }, 
    @Query('page') page: number, 
    @Query('limit') limit: number,
    @Query('order') order?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<PostEntity[]>> {
    const sortOrder = order ? order.toUpperCase() as 'ASC' | 'DESC' : 'DESC';
    return await this.postService.getSavedPosts(req.user.id, page, limit, sortOrder);
  }

  @Get(':userId')
  async getPostsByUser(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ): Promise<PaginatedResponse<PostEntity[]>> {
    return await this.postService.getPostsByUser(userId, page, limit);
  }
}
