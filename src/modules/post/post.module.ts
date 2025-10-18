import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { FriendModule } from '../friend/friend.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [FriendModule],
  exports: [PostService]
})
export class PostModule {}
