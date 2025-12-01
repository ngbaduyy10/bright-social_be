import { Controller, Get, Post, Delete, Query, Request, Param } from '@nestjs/common';
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

  @Get('suggested')
  getSuggestedFriends(
    @Request() req: { user: JwtUserDto },
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.friendService.getSuggestedFriends(req.user.id, page, limit);
  }

  @Post('request/:friendId')
  sendRequest(
    @Request() req: { user: JwtUserDto },
    @Param('friendId') friendId: string,
  ) {
    return this.friendService.sendRequest(req.user.id, friendId);
  }

  @Delete('request/:friendId')
  cancelRequest(
    @Request() req: { user: JwtUserDto },
    @Param('friendId') friendId: string,
  ) {
    return this.friendService.cancelRequest(req.user.id, friendId);
  }

  @Post('accept/:friendId')
  acceptRequest(
    @Request() req: { user: JwtUserDto },
    @Param('friendId') friendId: string,
  ) {
    return this.friendService.acceptRequest(req.user.id, friendId);
  }

  @Post('reject/:friendId')
  rejectRequest(
    @Request() req: { user: JwtUserDto },
    @Param('friendId') friendId: string,
  ) {
    return this.friendService.rejectRequest(req.user.id, friendId);
  }

  @Delete(':friendId')
  removeFriend(
    @Request() req: { user: JwtUserDto },
    @Param('friendId') friendId: string,
  ) {
    return this.friendService.removeFriend(req.user.id, friendId);
  }
}
