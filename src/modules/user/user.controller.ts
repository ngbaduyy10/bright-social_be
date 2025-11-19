import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
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

  @Get()
  @Public()
  findAll(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.userService.findAll({ keyword, limit, page });
  }
}
