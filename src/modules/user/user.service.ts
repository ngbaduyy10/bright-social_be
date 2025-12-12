import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePasswords, hashPassword } from '@/utils/helpers';
import { CacheService } from '@/config/cache';
import { PREFIX_USER_CACHE } from '@/utils/cacheVariables';
import { UserRepository } from '@/repositories/user.repository';
import { UserEntity } from '@/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Filter } from '@/utils/constant';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
    private readonly cloudinaryService: CloudinaryService,
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

  async findOneById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    imageFile?: Express.Multer.File,
    coverImageFile?: Express.Multer.File,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username) {
      if (updateUserDto.username !== user.username) {
        const existingUser = await this.userRepository.findOne({
          where: { username: updateUserDto.username },
        });

        if (existingUser) {
          throw new BadRequestException('Username already exists');
        }

        await this.cacheService.removeKey(PREFIX_USER_CACHE, user.username);
        
        user.username = updateUserDto.username;
      }
    }

    if (updateUserDto.first_name) user.first_name = updateUserDto.first_name;
    if (updateUserDto.last_name) user.last_name = updateUserDto.last_name;
    if (updateUserDto.gender) user.gender = updateUserDto.gender;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
    if (updateUserDto.bio !== undefined) user.bio = updateUserDto.bio;

    if (imageFile) {
      if (user.image_public_id) {
        try {
          await this.cloudinaryService.deleteImage(user.image_public_id);
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(imageFile);
      user.image = uploadResult.secure_url;
      user.image_public_id = uploadResult.public_id;
    }

    if (coverImageFile) {
      if (user.cover_image_public_id) {
        try {
          await this.cloudinaryService.deleteImage(user.cover_image_public_id);
        } catch (error) {
          console.error('Error deleting old cover image from Cloudinary:', error);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(coverImageFile);
      user.cover_image = uploadResult.secure_url;
      user.cover_image_public_id = uploadResult.public_id;
    }

    await this.cacheService.removeKey(PREFIX_USER_CACHE, user.username);

    await this.userRepository.save(user);
    return user;
  }
}
