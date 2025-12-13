import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

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

  @Post('admin/login')
  @Public()
  adminLogin(@Body() adminData: LoginDto) {
    return this.authService.adminLogin(adminData);
  }
}
