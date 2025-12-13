import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AdminEntity } from '@/entities/admin.entity';
import { AdminRole, Filter } from '@/utils/constant';

@Injectable()
export class AdminRepository extends Repository<AdminEntity> {
  constructor(private dataSource: DataSource) {
    super(AdminEntity, dataSource.createEntityManager());
  }

  async getAdminByEmail(email: string) {
    return await this
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where('admin.email = :email', { email })
      .getOne();
  }

  async getAllAdmins(filter: Filter) {
    const offset = (filter.page - 1) * filter.limit;
    const query = this.createQueryBuilder('admin')
      .where('admin.role != :role', { role: AdminRole.SUPER_ADMIN });

    if (filter.keyword) {
      query.andWhere(`
        LOWER(admin.first_name) LIKE :keyword 
        OR LOWER(admin.last_name) LIKE :keyword 
        OR LOWER(admin.email) LIKE :keyword
      `, { keyword: `%${filter.keyword.toLowerCase()}%` });
    }

    query.skip(offset).take(filter.limit);

    const [admins, total] = await query.getManyAndCount();
    return { admins, total };
  }
}

