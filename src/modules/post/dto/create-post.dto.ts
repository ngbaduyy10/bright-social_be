import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaType } from '@/utils/constant';

export class CreatePostMediaDto {
    @Matches(/^(https?:\/\/|data:image\/)/, { message: 'url must be a valid URL or data URL' })
    url: string;

    @IsEnum(MediaType)
    type: MediaType;

    @IsNumber()
    width: number;

    @IsNumber()
    height: number;
}

export class CreatePostDto {
    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreatePostMediaDto)
    media?: CreatePostMediaDto[];
}
