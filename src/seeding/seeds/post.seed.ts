import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { PostEntity } from '@/entities/post.entity';
import { UserEntity } from '@/entities/user.entity';

export default class PostSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const postRepository = dataSource.getRepository(PostEntity);
    const userRepository = dataSource.getRepository(UserEntity);
    const postFactory = factoryManager.get(PostEntity);

    const users = await userRepository.find();
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please run user seeder first.');
      return;
    }

    const posts = [];
    for (const user of users) {
      const postCount = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < postCount; i++) {
        const post = await postFactory.make();
        post.user_id = user.id;
        posts.push(post);
      }
    }

    await postRepository.save(posts);
    
    console.log(`✅ ${posts.length} posts created successfully for ${users.length} users!`);
  }
}
