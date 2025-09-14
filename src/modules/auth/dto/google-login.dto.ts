import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
