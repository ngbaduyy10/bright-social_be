import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { MediaEntity } from '@/entities/media.entity';
import { PostEntity } from '@/entities/post.entity';
import { faker } from '@faker-js/faker';

export default class MediaSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const mediaRepository = dataSource.getRepository(MediaEntity);
    const postRepository = dataSource.getRepository(PostEntity);
    const mediaFactory = factoryManager.get(MediaEntity);

    const posts = await postRepository.find();
    
    if (posts.length === 0) {
      console.log('⚠️  No posts found. Please run post seeder first.');
      return;
    }

    const allMedia = [];
    
    for (const post of posts) {
      const mediaCount = faker.number.int({ min: 1, max: 7 });
      
      for (let i = 0; i < mediaCount; i++) {
        const media = await mediaFactory.make();
        media.user_id = post.user_id;
        media.post_id = post.id;
        media.order = i;
        allMedia.push(media);
      }
    }

    await mediaRepository.save(allMedia);
    console.log(`✅ ${allMedia.length} media items created successfully for ${posts.length} posts!`);
  }
}
