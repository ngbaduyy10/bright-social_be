import { Controller, Get, Query, Request } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getFriends(
    @Request() req: { user: JwtUserDto },
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.friendService.getFriends(req.user.id, page, limit);
  }

  @Get('request')
  getFriendRequests(
    @Request() req: { user: JwtUserDto },
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.friendService.getFriendRequests(req.user.id, page, limit);
  }
  
  @Get('sent')
  getSentRequests(
    @Request() req: { user: JwtUserDto },
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.friendService.getSentRequests(req.user.id, page, limit);
  }
}
