import { Controller, Get, Param } from '@nestjs/common';
import { FriendService } from './friend.service';
import { Public } from '@/decorators/public.decorator';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get(':userId')
  @Public()
  getFriends(@Param('userId') userId: string) {
    return this.friendService.getFriends(userId);
  }
}
