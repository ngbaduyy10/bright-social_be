import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from '@/entities/user.entity';
import { CacheService } from '../cache/cache.service';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePasswords, hashPassword } from '@/utils/helpers';

// Mock the helper functions
jest.mock('@/utils/helpers', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
  comparePasswords: jest.fn(),
}));

const mockedComparePasswords = comparePasswords as jest.MockedFunction<
  typeof comparePasswords
>;
const mockedHashPassword = hashPassword as jest.MockedFunction<
  typeof hashPassword
>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  // let cacheService: jest.Mocked<CacheService>;

  const mockUser: Partial<UserEntity> = {
    id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'hashedPassword',
    is_verified: true,
  };

  const mockUserUnverified: Partial<UserEntity> = {
    id: '2',
    email: 'unverified@example.com',
    first_name: 'Jane',
    last_name: 'Doe',
    password: 'hashedPassword',
    is_verified: false,
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    // cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid and email is verified', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);
      mockedComparePasswords.mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      userRepository.findOne.mockResolvedValue(
        mockUserUnverified as UserEntity,
      );
      mockedComparePasswords.mockResolvedValue(true);

      await expect(
        service.validateUser('unverified@example.com', 'password'),
      ).rejects.toThrow(
        new UnauthorizedException('Please verify your email before logging in'),
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);

      const result = await service.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      password: 'password123',
    };

    it('should create user successfully when email does not exist', async () => {
      const { hashPassword } = require('@/utils/helpers');
      userRepository.findOne.mockResolvedValue(null); // Email doesn't exist
      userRepository.create.mockReturnValue(mockUser as UserEntity);
      userRepository.save.mockResolvedValue(mockUser as UserEntity);
      hashPassword.mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );
    });
  });
});
