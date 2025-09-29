import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { EmailVerificationService } from './email-verification.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EmailVerificationService],
  imports: [UserModule, EmailModule],
})
export class AuthModule {}
