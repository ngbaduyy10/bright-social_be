import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ImageEntity } from '@/entities/image.entity';
import { PostEntity } from '@/entities/post.entity';

export default class ImageSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const imageRepository = dataSource.getRepository(ImageEntity);
    const postRepository = dataSource.getRepository(PostEntity);
    const imageFactory = factoryManager.get(ImageEntity);

    const posts = await postRepository.find();
    
    if (posts.length === 0) {
      console.log('⚠️  No posts found. Please run post seeder first.');
      return;
    }

    const images = [];
    for (const post of posts) {
      const imageCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < imageCount; i++) {
        const image = await imageFactory.make();
        image.post_id = post.id;
        images.push(image);
      }
    }

    await imageRepository.save(images);
    
    console.log(`✅ ${images.length} images created successfully for ${posts.length} posts!`);
  }
}
