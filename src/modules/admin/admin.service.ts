import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminRepository } from '@/repositories/admin.repository';
import { comparePasswords, hashPassword } from '@/utils/helpers';
import { Filter, AdminRole } from '@/utils/constant';
import { AdminEntity } from '@/entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
  ) {}

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

  async activateAdmin(adminId: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    admin.is_active = true;
    await this.adminRepository.save(admin);
    
    return admin;
  }

  async deactivateAdmin(adminId: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    admin.is_active = false;
    await this.adminRepository.save(admin);
    
    return admin;
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<AdminEntity> {
    // Check if email already exists
    const existingAdminByEmail = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });
    if (existingAdminByEmail) {
      throw new BadRequestException('Email already exists');
    }

    // Check if username already exists
    const existingAdminByUsername = await this.adminRepository.findOne({
      where: { username: createAdminDto.username },
    });
    if (existingAdminByUsername) {
      throw new BadRequestException('Username already exists');
    }

    // Create admin with default password "123456" and role "admin"
    const hashedPassword = await hashPassword('123456');
    
    const admin = this.adminRepository.create({
      email: createAdminDto.email,
      username: createAdminDto.username,
      first_name: createAdminDto.first_name,
      last_name: createAdminDto.last_name,
      gender: createAdminDto.gender,
      password: hashedPassword,
      role: AdminRole.ADMIN,
    });

    await this.adminRepository.save(admin);
    const { password, ...result } = admin;
    return result as AdminEntity;
  }
}
