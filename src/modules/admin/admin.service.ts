import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminRepository } from '@/repositories/admin.repository';
import { comparePasswords } from '@/utils/helpers';
import { Filter } from '@/utils/constant';
import { AdminEntity } from '@/entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (admin && (await comparePasswords(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async findAll(filter: Filter): Promise<PaginatedResponse<AdminEntity[]>> {
    const { admins, total } = await this.adminRepository.getAllAdmins(filter);
    const meta: PaginationMeta = {
      page: filter.page,
      limit: filter.limit,
      total,
      totalPages: Math.ceil(total / filter.limit),
    };
    
    return { data: admins, meta };
  }
}
