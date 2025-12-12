import { IsString, IsOptional, MinLength, MaxLength, IsEnum, Matches } from 'class-validator';
import { Gender } from '@/utils/constant';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  first_name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  last_name?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}

