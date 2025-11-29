import { IsString, IsNotEmpty } from 'class-validator';

export class SavePostDto {
  @IsString()
  @IsNotEmpty()
  post_id: string;
}

