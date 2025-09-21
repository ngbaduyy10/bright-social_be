import { ImageEntity } from '@/entities/image.entity';
import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

export default setSeederFactory(ImageEntity, async (): Promise<ImageEntity> => {
  const image = new ImageEntity();
  image.url = faker.image.url();
  return image;
});
