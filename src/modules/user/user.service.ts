import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePasswords, hashPassword } from '@/utils/helpers';
import { CacheService } from '@/config/cache';
import { PREFIX_USER_CACHE } from '@/utils/cacheVariables';
import { UserRepository } from '@/repositories/user.repository';
import { UserEntity } from '@/entities/user.entity';
import { Filter } from '@/utils/constant';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (user && (await comparePasswords(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  private async generateRandomUsername(firstName: string, lastName: string): Promise<string> {
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    let username = baseUsername;
    let counter = 1;

    while (true) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      
      if (!existingUser) {
        return username;
      }
      
      const randomNum = Math.floor(Math.random() * 1000) + 1;
      username = `${baseUsername}${randomNum}`;
      counter++;
      
      if (counter > 100) {
        username = `${baseUsername}${Date.now()}`;
        break;
      }
    }
    
    return username;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const username = await this.generateRandomUsername(
      createUserDto.first_name,
      createUserDto.last_name
    );

    const user = this.userRepository.create({
      ...createUserDto,
      username,
      password: await hashPassword(createUserDto.password),
    });
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async createGoogleUser(createUserDto: CreateUserDto) {
    const username = await this.generateRandomUsername(
      createUserDto.first_name,
      createUserDto.last_name
    );

    const user = this.userRepository.create({
      ...createUserDto,
      username,
      password: null,
    });
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async findOneByUsername(username: string): Promise<UserEntity> {
    const user = await this.cacheService.execute<UserEntity>(
      PREFIX_USER_CACHE,
      username,
      async () => {
        return await this.userRepository.findOne({
          where: { username },
        });
      }
    );
    return user;
  }

  async findAll(filter: Filter): Promise<PaginatedResponse<UserEntity[]>> {
    const { users, total } = await this.userRepository.getAllUsers(filter);
    const meta: PaginationMeta = {
      page: filter.page,
      limit: filter.limit,
      total,
      totalPages: Math.ceil(total / filter.limit),
    };
    
    return { data: users, meta };
  }
}
