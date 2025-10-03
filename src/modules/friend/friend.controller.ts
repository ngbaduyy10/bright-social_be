import { Controller, Get, Request } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getFriends(@Request() req: { user: JwtUserDto }) {
    return this.friendService.getAll(req.user.id);
  }
}
