import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { StoryEntity } from '@/entities/story.entity';
import { UserEntity } from '@/entities/user.entity';

export default class StorySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const storyFactory = factoryManager.get(StoryEntity);
    
    const users = await userRepository.find();
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please run user seeder first.');
      return;
    }
    
    let totalStoriesCreated = 0;
    
    for (const user of users) {
      const numberOfStories = Math.floor(Math.random() * 5) + 1;
      
      if (numberOfStories > 0) {
        for (let i = 0; i < numberOfStories; i++) {
          const story = await storyFactory.make();
          story.user_id = user.id;
          
          await storyFactory.save(story);
          totalStoriesCreated++;
        }
      }
    }
    
    console.log(`✅ ${totalStoriesCreated} stories created for ${users.length} users successfully!`);
  }
}
