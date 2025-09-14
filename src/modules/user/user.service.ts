import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { comparePasswords, hashPassword } from '@/utils/helpers';
import { CacheService } from '../cache/cache.service';
import { PREFIX_USER_CACHE } from '@/utils/cacheVariables';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (user && (await comparePasswords(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: await hashPassword(createUserDto.password),
    });
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async createGoogleUser(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      ...createUserDto,
      password: null,
    });
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.cacheService.execute(
      PREFIX_USER_CACHE,
      id.toString(),
      async () => {
        return await this.userRepository.findOne({
          where: { id },
        });
      }
    );
    return user;
  }
}
