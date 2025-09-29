import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    googleLogin: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verifyEmail', () => {
    it('should verify email successfully with valid token', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'valid-jwt-token',
      };
      const expectedResult = {
        message: 'Email verified successfully! Welcome to Bright Social.',
        user: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          email_verified: true,
        },
      };

      mockAuthService.verifyEmail.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.verifyEmail(verifyEmailDto);

      // Assert
      expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto);
      expect(authService.verifyEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle invalid token', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'invalid-token',
      };

      mockAuthService.verifyEmail.mockRejectedValue(
        new BadRequestException('Invalid verification token'),
      );

      // Act & Assert
      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto);
    });

    it('should handle expired token', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'expired-token',
      };

      mockAuthService.verifyEmail.mockRejectedValue(
        new BadRequestException('Verification token has expired'),
      );

      // Act & Assert
      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto);
    });

    it('should handle already verified email', async () => {
      // Arrange
      const verifyEmailDto: VerifyEmailDto = {
        token: 'valid-token-already-verified',
      };

      mockAuthService.verifyEmail.mockRejectedValue(
        new BadRequestException('Email is already verified'),
      );

      // Act & Assert
      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const expectedResult = {
        message: 'Verification email sent successfully!',
      };

      mockAuthService.resendVerificationEmail.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.resendVerificationEmail(email);

      // Assert
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(email);
      expect(authService.resendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle user not found when resending', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      mockAuthService.resendVerificationEmail.mockRejectedValue(
        new BadRequestException('User not found'),
      );

      // Act & Assert
      await expect(controller.resendVerificationEmail(email)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(email);
    });

    it('should handle already verified email when resending', async () => {
      // Arrange
      const email = 'verified@example.com';

      mockAuthService.resendVerificationEmail.mockRejectedValue(
        new BadRequestException('Email is already verified'),
      );

      // Act & Assert
      await expect(controller.resendVerificationEmail(email)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('register', () => {
    it('should register user and send verification email', async () => {
      // Arrange
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };
      const expectedResult = {
        message:
          'Registration successful! Please check your email to verify your account.',
        email: 'newuser@example.com',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.register(createUserDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
      expect(result.message).toContain('verify your account');
    });
  });
});
