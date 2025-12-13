import { AdminEntity } from '@/entities/admin.entity';
import { setSeederFactory } from 'typeorm-extension';
import { AdminRole, Gender } from '@/utils/constant';
import { faker } from '@faker-js/faker';
import { hashPassword } from '@/utils/helpers';

export default setSeederFactory(AdminEntity, async (): Promise<AdminEntity> => {
  const admin = new AdminEntity();
  admin.first_name = faker.person.firstName();
  admin.last_name = faker.person.lastName();
  admin.email = faker.internet.email();
  admin.username = faker.internet.username().toLowerCase();
  admin.image = faker.image.avatar();
  admin.gender = faker.helpers.arrayElement(Object.values(Gender));
  admin.password = await hashPassword(faker.internet.password());
  admin.role = AdminRole.ADMIN;
  return admin;
});

