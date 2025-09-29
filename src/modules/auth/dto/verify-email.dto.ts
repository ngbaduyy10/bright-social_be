import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyEmailDto {
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @Matches(/^(?!\s*$).+/, {
    message: 'Token cannot be empty or contain only whitespace',
  })
  @Transform(({ value }) => value?.trim())
  token: string;
}
