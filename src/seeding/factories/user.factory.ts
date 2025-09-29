import { UserEntity } from '@/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';
import { Gender } from '@/utils/constant';
import { faker } from '@faker-js/faker';
import { hashPassword } from '@/utils/helpers';

export default setSeederFactory(UserEntity, async (): Promise<UserEntity> => {
  const user = new UserEntity();
  user.first_name = faker.person.firstName();
  user.last_name = faker.person.lastName();
  user.email = faker.internet.email();
  user.username = faker.internet.username().toLowerCase();
  user.is_verified = true;
  user.image = faker.image.avatar();
  user.cover_image = faker.image.url();
  user.bio = faker.lorem.sentence();
  user.gender = faker.helpers.arrayElement(Object.values(Gender));
  user.phone = faker.phone.number();
  user.password = await hashPassword(faker.internet.password());
  return user;
});