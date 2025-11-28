import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FriendEntity } from '@/entities/friend.entity';
import { FriendStatus } from '@/utils/constant';

@Injectable()
export class FriendRepository extends Repository<FriendEntity> {
  constructor(private dataSource: DataSource) {
    super(FriendEntity, dataSource.createEntityManager());
  }

  async getAll(userId: string) {
    const friends = await this
      .createQueryBuilder('friend')
      .where('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .andWhere('(friend.user_id = :userId)', { userId })
      .getMany();

    return friends;
  }

  async getPaginatedFriends(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [friends, total] = await this
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.friend', 'friendUser')
      .where('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .andWhere('(friend.user_id = :userId)', { userId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { friends, total };
  }

  async getFriendRequests(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [friendRequests, total] = await this
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.user', 'users')
      .where('friend.status = :status', { status: FriendStatus.PENDING })
      .andWhere('(friend.friend_id = :userId)', { userId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { friendRequests, total };
  }

  async getSentRequests(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [sentRequests, total] = await this
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.friend', 'friendUser')
      .where('friend.status = :status', { status: FriendStatus.PENDING })
      .andWhere('(friend.user_id = :userId)', { userId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();
      
    return { sentRequests, total };
  }

  async getMutualFriendsCount(userId1: string, userId2: string): Promise<number> {
    const user1Friends = await this
      .createQueryBuilder('friend')
      .select('friend.friend_id', 'friendId')
      .where('friend.user_id = :userId1', { userId1 })
      .andWhere('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .getRawMany();
    
    const user1FriendIds = user1Friends.map(f => f.friendId);
    
    if (user1FriendIds.length === 0) {
      return 0;
    }
    
    const mutualCount = await this
      .createQueryBuilder('friend')
      .where('friend.user_id = :userId2', { userId2 })
      .andWhere('friend.friend_id IN (:...friendIds)', { friendIds: user1FriendIds })
      .andWhere('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .getCount();
    
    return mutualCount;
  }

  async getMutualFriendsCountBatch(userId: string, friendIds: string[]): Promise<Map<string, number>> {
    if (friendIds.length === 0) {
      return new Map();
    }

    const userFriends = await this
      .createQueryBuilder('friend')
      .select('friend.friend_id', 'friendId')
      .where('friend.user_id = :userId', { userId })
      .andWhere('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .getRawMany();
    
    const userFriendIds = userFriends.map(f => f.friendId);
    
    if (userFriendIds.length === 0) {
      return new Map(friendIds.map(id => [id, 0]));
    }

    const mutualCounts = await this
      .createQueryBuilder('friend')
      .select('friend.user_id', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('friend.user_id IN (:...friendIds)', { friendIds })
      .andWhere('friend.friend_id IN (:...userFriendIds)', { userFriendIds })
      .andWhere('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .groupBy('friend.user_id')
      .getRawMany();

    const resultMap = new Map<string, number>();
    friendIds.forEach(id => resultMap.set(id, 0));
    mutualCounts.forEach(item => {
      resultMap.set(item.userId, parseInt(item.count, 10));
    });

    return resultMap;
  }

  async getUsersWithRelationship(userId: string): Promise<string[]> {
    const relationshipsAsUser = await this
      .createQueryBuilder('friend')
      .select('friend.friend_id', 'relatedUserId')
      .where('friend.user_id = :userId', { userId })
      .getRawMany();
    
    const relationshipsAsFriend = await this
      .createQueryBuilder('friend')
      .select('friend.user_id', 'relatedUserId')
      .where('friend.friend_id = :userId', { userId })
      .getRawMany();
    
    const allRelatedUserIds = [
      ...relationshipsAsUser.map(r => r.relatedUserId),
      ...relationshipsAsFriend.map(r => r.relatedUserId),
    ];
    
    return [...new Set(allRelatedUserIds)];
  }

}
