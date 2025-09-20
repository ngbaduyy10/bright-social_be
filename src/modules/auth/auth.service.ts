import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userData: CreateUserDto) {
    return await this.usersService.create(userData);
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
      user,
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
        user: newUser,
      };
    }
  }
}
