import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, AdminModule],
})
export class AuthModule {}
