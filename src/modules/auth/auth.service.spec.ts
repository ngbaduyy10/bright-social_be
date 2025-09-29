import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { EmailVerificationService } from './email-verification.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let emailService: EmailService;
  let emailVerificationService: EmailVerificationService;

  const mockEmailVerificationService = {
    generateVerificationToken: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockUserService = {
    create: jest.fn(),
    getUserByEmail: jest.fn(),
    findById: jest.fn(),
    markEmailAsVerified: jest.fn(),
    validateUser: jest.fn(),
    createGoogleUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    emailVerificationService = module.get<EmailVerificationService>(
      EmailVerificationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register user and send verification email', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: false,
      };

      const mockToken = 'jwt-verification-token';

      mockUserService.create.mockResolvedValue(mockUser);
      mockEmailVerificationService.generateVerificationToken.mockReturnValue(
        mockToken,
      );
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.register(createUserDto);

      // Assert
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(
        emailVerificationService.generateVerificationToken,
      ).toHaveBeenCalledWith(mockUser.email, mockUser.id);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockToken,
        mockUser.first_name,
      );
      expect(result).toEqual({
        message:
          'Registration successful! Please check your email to verify your account.',
        email: mockUser.email,
      });
    });

    it('should handle email service failure', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: false,
      };

      mockUserService.create.mockResolvedValue(mockUser);
      mockEmailVerificationService.generateVerificationToken.mockReturnValue(
        'token',
      );
      mockEmailService.sendVerificationEmail.mockRejectedValue(
        new Error('Email service unavailable'),
      );

      // Act & Assert
      await expect(service.register(createUserDto)).rejects.toThrow(
        'Email service unavailable',
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'valid-jwt-token',
      };

      const mockDecodedToken = {
        userId: '123',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: false,
      };

      mockEmailVerificationService.verifyToken.mockReturnValue(
        mockDecodedToken,
      );
      mockUserService.findById.mockResolvedValue(mockUser);
      mockUserService.markEmailAsVerified.mockResolvedValue(undefined);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.verifyEmail(verifyEmailDto);

      // Assert
      expect(emailVerificationService.verifyToken).toHaveBeenCalledWith(
        verifyEmailDto.token,
      );
      expect(userService.findById).toHaveBeenCalledWith(
        mockDecodedToken.userId,
      );
      expect(userService.markEmailAsVerified).toHaveBeenCalledWith(
        mockDecodedToken.userId,
      );
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.first_name,
      );
      expect(result).toEqual({
        message: 'Email verified successfully! Welcome to Bright Social.',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          is_verified: true,
        },
      });
    });

    it('should throw error for invalid token type', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'invalid-type-token',
      };

      const invalidTokenError = new Error('Invalid token type');
      mockEmailVerificationService.verifyToken.mockImplementation(() => {
        throw invalidTokenError;
      });

      // Act & Assert
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        'Invalid verification token type',
      );
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'valid-token-nonexistent-user',
      };

      const mockDecodedToken = {
        userId: '999',
      };

      mockEmailVerificationService.verifyToken.mockReturnValue(
        mockDecodedToken,
      );
      mockUserService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error for already verified email', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'valid-token-already-verified',
      };

      const mockDecodedToken = {
        userId: '123',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true, // Already verified
      };

      mockEmailVerificationService.verifyToken.mockReturnValue(
        mockDecodedToken,
      );
      mockUserService.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        'Email is already verified',
      );
    });

    it('should handle expired token', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'expired-token',
      };

      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      mockEmailVerificationService.verifyToken.mockImplementation(() => {
        throw expiredError;
      });

      // Act & Assert
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        'Verification token has expired',
      );
    });

    it('should handle malformed token', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'malformed-token',
      };

      const malformedError = new Error('Invalid token');
      malformedError.name = 'JsonWebTokenError';
      mockEmailVerificationService.verifyToken.mockImplementation(() => {
        throw malformedError;
      });

      // Act & Assert
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        'Invalid verification token',
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        is_verified: false,
      };
      const mockToken = 'new-verification-token';

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockEmailVerificationService.generateVerificationToken.mockReturnValue(
        mockToken,
      );
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.resendVerificationEmail(email);

      // Assert
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(
        emailVerificationService.generateVerificationToken,
      ).toHaveBeenCalledWith(mockUser.email, mockUser.id);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockToken,
        mockUser.first_name,
      );
      expect(result).toEqual({
        message: 'Verification email sent successfully!',
      });
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockUserService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resendVerificationEmail(email)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resendVerificationEmail(email)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error for already verified email', async () => {
      // Arrange
      const email = 'verified@example.com';
      const mockUser = {
        id: '123',
        email: 'verified@example.com',
        first_name: 'John',
        is_verified: true, // Already verified
      };

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.resendVerificationEmail(email)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resendVerificationEmail(email)).rejects.toThrow(
        'Email is already verified',
      );
    });
  });
});
