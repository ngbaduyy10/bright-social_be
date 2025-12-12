import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [CloudinaryModule],
  exports: [UserService],
})
export class UserModule {}
