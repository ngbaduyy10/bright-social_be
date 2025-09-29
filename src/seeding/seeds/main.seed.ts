import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserEntity } from '@/entities/user.entity';
import { FriendEntity } from '@/entities/friend.entity';
import { hashPassword } from '@/utils/helpers';
import { FriendStatus } from '@/utils/constant';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const friendRepository = dataSource.getRepository(FriendEntity);

    const staticUser = userRepository.create({
      email: 'ngbaduyy05@gmail.com',
      first_name: 'Duy',
      last_name: 'Nguyen',
      username: 'ngbaduyy05',
      password: await hashPassword('123456'),
      gender: null,
      phone: null,
      image: null,
      cover_image: null,
      bio: null,
      is_verified: true,
    });

    await userRepository.save(staticUser);

    const allUsers = await userRepository.find();
    const otherUsers = allUsers.filter(user => user.id !== staticUser.id);

    if (otherUsers.length > 0) {
      const friendRelationships: FriendEntity[] = [];

      for (const otherUser of otherUsers) {
        const friendship1 = friendRepository.create({
          user_id: staticUser.id,
          friend_id: otherUser.id,
          status: FriendStatus.ACCEPTED,
        });
        friendRelationships.push(friendship1);

        const friendship2 = friendRepository.create({
          user_id: otherUser.id,
          friend_id: staticUser.id,
          status: FriendStatus.ACCEPTED,
        });
        friendRelationships.push(friendship2);
      }

      await friendRepository.save(friendRelationships);
    } else {
      console.log('ℹ️ No other users found to create friendships with');
    }
  }
}
