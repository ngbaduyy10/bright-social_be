import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Gender } from '@/utils/constant';

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
