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

    // Get all users
    const users = await userRepository.find();
    
    if (users.length < 2) {
      console.log('Not enough users to create friendships');
      return;
    }

    const friendRelationships: FriendEntity[] = [];
    const existingRelationships = new Set<string>();

    // For each user, create 5-10 friendships
    for (const user of users) {
      const numberOfFriends = faker.number.int({ min: 5, max: 10 });
      const availableUsers = users.filter(u => u.id !== user.id);
      
      // Shuffle and take random users
      const shuffledUsers = faker.helpers.shuffle([...availableUsers]);
      const selectedFriends = shuffledUsers.slice(0, Math.min(numberOfFriends, availableUsers.length));

      for (const friend of selectedFriends) {
        // Create a unique key for the relationship (both directions)
        const key1 = `${user.id}-${friend.id}`;
        const key2 = `${friend.id}-${user.id}`;
        
        // Skip if relationship already exists
        if (existingRelationships.has(key1) || existingRelationships.has(key2)) {
          continue;
        }

        // Create bidirectional friendship
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

        // Mark both directions as existing
        existingRelationships.add(key1);
        existingRelationships.add(key2);
      }
    }

    // Save all friendships
    await friendRepository.save(friendRelationships);
    console.log(`Created ${friendRelationships.length} friend relationships`);
  }
}
