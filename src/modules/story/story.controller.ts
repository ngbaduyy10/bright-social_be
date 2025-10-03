import { Controller, Get, Query, Request } from '@nestjs/common';
import { StoryService } from './story.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Get()
  getStoriesByFriends(
    @Request() req: { user: JwtUserDto }, 
    @Query('page') page: number, 
    @Query('limit') limit: number
  ) {
    return this.storyService.getStoriesByFriends(req.user.id, page, limit);
  }
}
