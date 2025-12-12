import { Controller, Get, Post, Patch, Body, Query, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  async getCurrentUser(
    @Request() req: { user: JwtUserDto },
  ) {
    return await this.userService.findOneById(req.user.id);
  }

  @Get()
  @Public()
  findAll(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.userService.findAll({ keyword, limit, page });
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'cover_image', maxCount: 1 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  async updateUser(
    @Request() req: { user: JwtUserDto },
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      cover_image?: Express.Multer.File[];
    },
  ) {
    const imageFile = files?.image?.[0];
    const coverImageFile = files?.cover_image?.[0];

    return await this.userService.updateUser(
      req.user.id,
      updateUserDto,
      imageFile,
      coverImageFile,
    );
  }
}
