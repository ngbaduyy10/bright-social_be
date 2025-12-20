import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '@/entities/user.entity';
import { Filter } from '@/utils/constant';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async getAllUsers(filter: Filter) {
    const offset = (filter.page - 1) * filter.limit;
    const query = this.createQueryBuilder('user');

    if (filter.keyword) {
      query.where(`
        LOWER(user.first_name) LIKE :keyword 
        OR LOWER(user.last_name) LIKE :keyword 
      `, { keyword: `%${filter.keyword.toLowerCase()}%` }
      );
    }

    query
      .orderBy('user.created_at', 'DESC')
      .addOrderBy('user.id', 'DESC')
      .skip(offset)
      .take(filter.limit);

    const [users, total] = await query.getManyAndCount();
    return { users, total };
  }

  async getUserByEmail(email: string) {
    return await this
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }
}
