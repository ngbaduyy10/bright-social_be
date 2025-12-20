import { Controller, Get, Query, Patch, Param, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Public } from '@/decorators/public.decorator';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Post()
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.adminService.createAdmin(createAdminDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.adminService.findAll({ keyword, limit, page });
  }

  @Patch(':id/active')
  async activateAdmin(@Param('id') id: string) {
    return await this.adminService.activateAdmin(id);
  }

  @Patch(':id/inactive')
  async deactivateAdmin(@Param('id') id: string) {
    return await this.adminService.deactivateAdmin(id);
  }
}
