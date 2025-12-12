import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { FriendModule } from '../friend/friend.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [FriendModule, CloudinaryModule],
  exports: [PostService]
})
export class PostModule {}
