import { Controller, Get, Query, Request } from '@nestjs/common';
import { StoryService } from './story.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { StoryEntity } from '@/entities/story.entity';
import { ResponseMessage } from '@/decorators/responseMessage.decorator';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Get()
  async getLatestFriendsStories(
    @Request() req: { user: JwtUserDto }, 
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return await this.storyService.getStoriesByFriends(req.user.id, page, limit);
  }
}
