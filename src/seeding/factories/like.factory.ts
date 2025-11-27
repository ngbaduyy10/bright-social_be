import { LikeEntity } from '@/entities/like.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(LikeEntity, async (): Promise<LikeEntity> => {
  const like = new LikeEntity();
  return like;
});

