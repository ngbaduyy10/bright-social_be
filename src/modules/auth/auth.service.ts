import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { EmailService } from '../email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationService } from './email-verification.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async register(userData: CreateUserDto) {
    const user = await this.usersService.create(userData);

    const verificationToken =
      this.emailVerificationService.generateVerificationToken(
        user.email,
        user.id,
      );

    this.sendVerificationEmailAsync(
      user.email,
      verificationToken,
      user.first_name || 'User',
    );

    return {
      message:
        'Registration successful! Please check your email to verify your account.',
      email: user.email,
    };
  }

  private sendVerificationEmailAsync(
    email: string,
    token: string,
    userName: string,
  ): void {
    Promise.resolve().then(async () => {
      try {
        await this.emailService.sendVerificationEmail(email, token, userName);
      } catch (error) {
        console.error(`Failed to send verification email to ${email}:`, error);
        //Note:send email error, implement retry logic
      }
    });
  }

  async login(userData: LoginDto) {
    const user = await this.usersService.validateUser(
      userData.email,
      userData.password,
    );
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: user,
    };
  }

  async googleLogin(googleData: GoogleLoginDto) {
    let user = await this.usersService.getUserByEmail(googleData.email);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: userWithoutPassword,
      };
    } else {
      const newUserData: CreateUserDto = {
        email: googleData.email,
        first_name: googleData.first_name,
        last_name: googleData.last_name,
        password: '',
      };

      const newUser = await this.usersService.createGoogleUser(newUserData);

      const payload = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      };

      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: user,
      };
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const { userId } = this.emailVerificationService.verifyToken(
        verifyEmailDto.token,
      );

      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.is_verified) {
        throw new ConflictException('Email is already verified');
      }

      await this.usersService.markEmailAsVerified(userId);

      try {
        await this.emailService.sendWelcomeEmail(
          user.email,
          user.first_name || 'User',
        );
      } catch (emailError) {
        console.log(
          'Failed to send welcome email, but verification succeeded:',
          emailError,
        );
      }

      return {
        message: 'Email verified successfully! Welcome to Bright Social.',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_verified: true,
        },
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Verification token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid verification token');
      }
      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Verification token is not yet valid');
      }
      if (error.message?.includes('Token is required')) {
        throw new BadRequestException('Verification token is required');
      }
      if (error.message?.includes('Token must be a string')) {
        throw new BadRequestException('Verification token must be a string');
      }
      if (
        error.message?.includes('Invalid token type') ||
        error.message?.includes('Invalid token structure')
      ) {
        throw new BadRequestException('Invalid verification token format');
      }
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Email verification failed');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_verified) {
      throw new ConflictException('Email is already verified');
    }

    const verificationToken =
      this.emailVerificationService.generateVerificationToken(
        user.email,
        user.id,
      );

    this.sendVerificationEmailAsync(
      user.email,
      verificationToken,
      user.first_name || 'User',
    );

    return {
      message: 'Verification email sent successfully!',
    };
  }
}
