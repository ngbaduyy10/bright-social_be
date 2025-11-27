import { CommentEntity } from '@/entities/comment.entity';
import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

export default setSeederFactory(CommentEntity, async (): Promise<CommentEntity> => {
  const comment = new CommentEntity();
  comment.content = faker.lorem.sentence();
  return comment;
});

