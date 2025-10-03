import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { FriendModule } from '../friend/friend.module';

@Module({
  controllers: [StoryController],
  providers: [StoryService],
  imports: [FriendModule]
})
export class StoryModule {}
