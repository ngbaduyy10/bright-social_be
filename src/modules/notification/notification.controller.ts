import { Controller, Get, Query, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { NotificationEntity } from '@/entities/notification.entity';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Request() req: { user: JwtUserDto },
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PaginatedResponse<NotificationEntity[]>> {
    return await this.notificationService.getNotificationsByUserId(req.user.id, page, limit);
  }

  @Get('unseen-count')
  async getUnseenCount(
    @Request() req: { user: JwtUserDto },
  ): Promise<{ unseen_count: number }> {
    return await this.notificationService.getUnseenCount(req.user.id);
  }
}
