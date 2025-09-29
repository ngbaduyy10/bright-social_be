import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/entities/user.entity';
import { comparePasswords, hashPassword } from '@/utils/helpers';
import { CacheService } from '@/config/cache';
import { PREFIX_USER_CACHE } from '@/utils/cacheVariables';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) 
    private readonly userRepository: Repository<UserEntity>,
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
    const existingUser = await this.getUserByEmail(createUserDto.email);
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

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.cacheService.execute(
      PREFIX_USER_CACHE,
      id,
      async () => {
        return await this.userRepository.findOne({
          where: { id },
        });
      }
    );
    return user;
  }
}
