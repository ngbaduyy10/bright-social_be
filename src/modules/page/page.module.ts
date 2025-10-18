import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { StoryModule } from '../story/story.module';

@Module({
  controllers: [PageController],
  providers: [PageService],
  imports: [UserModule, PostModule, StoryModule]
})
export class PageModule {}
