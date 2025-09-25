import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, EmailModule],
})
export class AuthModule {}
