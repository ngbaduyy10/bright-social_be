import { Controller, Post, Delete, Request, Param } from '@nestjs/common';
import { SaveService } from './save.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { ResponseMessage } from '@/decorators/responseMessage.decorator';

@Controller('save')
export class SaveController {
  constructor(private readonly saveService: SaveService) {}

  @Post(':postId')
  @ResponseMessage('Post saved successfully')
  async savePost(
    @Request() req: { user: JwtUserDto },
    @Param('postId') postId: string,
  ) {
    return await this.saveService.savePost(req.user.id, postId);
  }

  @Delete(':postId')
  @ResponseMessage('Post unsaved successfully')
  async unsavePost(
    @Request() req: { user: JwtUserDto },
    @Param('postId') postId: string,
  ) {
    return await this.saveService.unsavePost(req.user.id, postId);
  }
}
