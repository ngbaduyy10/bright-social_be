import { Controller, Get, Post, Delete, Patch, Param, Query, Request, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { PostEntity } from '@/entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async findAll(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Request() req: { user: JwtUserDto }
  ): Promise<PaginatedResponse<PostEntity[]>> {
    return await this.postService.findAll({ keyword, limit, page }, req.user.id);
  }

  @Get('friend')
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

  @Get('user/:userId')
  async getPostsByUser(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req: { user: JwtUserDto }
  ): Promise<PaginatedResponse<PostEntity[]>> {
    return await this.postService.getPostsByUser(userId, page, limit, req.user.id);
  }

  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @Request() req: { user: JwtUserDto }
  ): Promise<PostEntity> {
    return await this.postService.getPostById(id, req.user.id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('media', 10, { limits: { fileSize: 5 * 1024 * 1024 } }))
  async createPost(
    @Request() req: { user: JwtUserDto },
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<PostEntity> {
    return await this.postService.createPost(
      req.user.id,
      createPostDto.content,
      files,
    );
  }

  @Patch(':id/active')
  async activatePost(
    @Param('id') id: string,
    @Request() req: { user: JwtUserDto },
  ): Promise<PostEntity> {
    return await this.postService.activatePost(id, req.user.id);
  }

  @Patch(':id/inactive')
  async deactivatePost(
    @Param('id') id: string,
    @Request() req: { user: JwtUserDto },
  ): Promise<PostEntity> {
    return await this.postService.deactivatePost(id, req.user.id);
  }

  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
    @Request() req: { user: JwtUserDto },
  ): Promise<{ message: string }> {
    await this.postService.deletePost(id, req.user.id);
    return { message: 'Post deleted successfully' };
  }
}
