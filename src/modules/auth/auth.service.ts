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
      phone: user.phone,
      image: user.image,
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
        phone: user.phone,
        image: user.image,
      };
      
      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: userWithoutPassword,
      };
    } else {
      const newUserData: CreateUserDto = {
        email: googleData.email,
        username: googleData.username,
        password: '',
      };
      
      const newUser = await this.usersService.createGoogleUser(newUserData);
      
      const payload = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        phone: newUser.phone,
        image: newUser.image,
      };
      
      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: newUser,
      };
    }
  }
}
