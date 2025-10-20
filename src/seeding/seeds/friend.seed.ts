import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { FriendEntity } from '@/entities/friend.entity';
import { UserEntity } from '@/entities/user.entity';
import { FriendStatus } from '@/utils/constant';
import { faker } from '@faker-js/faker';

export default class FriendSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const friendRepository = dataSource.getRepository(FriendEntity);
    const userRepository = dataSource.getRepository(UserEntity);

    const users = await userRepository.find();
    
    if (users.length < 2) {
      console.log('Not enough users to create friendships');
      return;
    }

    const friendRelationships: FriendEntity[] = [];
    const existingRelationships = new Set<string>();

    for (const user of users) {
      const numberOfFriends = faker.number.int({ min: 10, max: 20 });
      const availableUsers = users.filter(u => u.id !== user.id);
      
      const shuffledUsers = faker.helpers.shuffle([...availableUsers]);
      const selectedFriends = shuffledUsers.slice(0, Math.min(numberOfFriends, availableUsers.length));

      for (const friend of selectedFriends) {
        const key1 = `${user.id}-${friend.id}`;
        const key2 = `${friend.id}-${user.id}`;
        
        if (existingRelationships.has(key1) || existingRelationships.has(key2)) {
          continue;
        }

        const friendship1 = new FriendEntity();
        friendship1.user_id = user.id;
        friendship1.friend_id = friend.id;
        friendship1.status = FriendStatus.ACCEPTED;
        friendRelationships.push(friendship1);

        const friendship2 = new FriendEntity();
        friendship2.user_id = friend.id;
        friendship2.friend_id = user.id;
        friendship2.status = FriendStatus.ACCEPTED;
        friendRelationships.push(friendship2);

        existingRelationships.add(key1);
        existingRelationships.add(key2);
      }
    }

    await friendRepository.save(friendRelationships);
    console.log(`✅ ${friendRelationships.length / 2} friend relationships created successfully`);
  }
}
