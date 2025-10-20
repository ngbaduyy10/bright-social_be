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

}
