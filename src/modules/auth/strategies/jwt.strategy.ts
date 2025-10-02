import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUserDto } from '../dto/jwt-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtUserDto): Promise<JwtUserDto> {
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      first_name: payload.first_name,
      last_name: payload.last_name,
    };
  }
}