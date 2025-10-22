import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { PageService } from './page.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('page')
export class PageController {
  constructor(
    private readonly pageService: PageService,
  ) {}

  @Get('news-feed')
  async getNewsFeedPage(
    @Request() req: { user: JwtUserDto },
    @Query('story-limit') storyLimit: number,
    @Query('post-limit') postLimit: number,
  ) {
    return this.pageService.getNewsFeedPage(req.user.id, storyLimit, postLimit);
  }

  @Get('profile/:username')
  async getProfilePage(
    @Param('username') username: string,
    @Query('post-limit') postLimit: number,
    @Query('story-limit') storyLimit: number,
    @Query('media-limit') mediaLimit: number,
  ) {
    return this.pageService.getProfilePage(username, postLimit, storyLimit, mediaLimit);
  }

  @Get('search')
  async getSearchPage(
    @Query('keyword') keyword: string,
    @Query('user-limit') userLimit: number,
    @Query('post-limit') postLimit: number,
  ) {
    return this.pageService.getSearchPage(keyword, userLimit, postLimit);
  }
}
