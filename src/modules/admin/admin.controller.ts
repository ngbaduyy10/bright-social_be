import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Public } from '@/decorators/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get()
  @Public()
  findAll(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.adminService.findAll({ keyword, limit, page });
  }
}
