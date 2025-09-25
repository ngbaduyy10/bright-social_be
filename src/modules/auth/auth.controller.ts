import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() userData: CreateUserDto) {
    return this.authService.register(userData);
  }

  @Post('login')
  @Public()
  login(@Body() userData: LoginDto) {
    return this.authService.login(userData);
  }

  @Post('google-login')
  @Public()
  googleLogin(@Body() googleData: GoogleLoginDto) {
    return this.authService.googleLogin(googleData);
  }

  @Post('verify-email')
  @Public()
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @Public()
  resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}
