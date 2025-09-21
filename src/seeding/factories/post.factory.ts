import { PostEntity } from '@/entities/post.entity';
import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

export default setSeederFactory(PostEntity, async (): Promise<PostEntity> => {
  const post = new PostEntity();
  post.content = faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }));
  // user_id will be set by the seeder when creating posts
  return post;
});
