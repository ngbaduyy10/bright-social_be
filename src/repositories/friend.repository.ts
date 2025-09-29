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
      .leftJoinAndSelect('friend.friend', 'friendUser')
      .where('friend.status = :status', { status: FriendStatus.ACCEPTED })
      .andWhere('(friend.user_id = :userId)', { userId })
      .getMany();

    friends.forEach(friend => {
      delete friend.friend.password;
    });

    return friends;
  }
}
