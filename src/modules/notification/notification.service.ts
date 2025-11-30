import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationRepository } from '@/repositories/notification.repository';
import { NotificationEntity } from '@/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotificationsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<NotificationEntity[]>> {
    const { notifications, total } = await this.notificationRepository.getNotificationsByUserId(
      userId,
      page,
      limit,
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { data: notifications, meta };
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.notificationRepository.update(
      { id: notificationId },
      {
        is_seen: true,
        seen_at: new Date(),
      },
    );
  }

  async markAllNotificationsAsRead(userId: string) {
    await this.notificationRepository.update(
      { user_id: userId, is_seen: false },
      {
        is_seen: true,
        seen_at: new Date(),
      },
    );
  }

  async getUnseenCount(userId: string): Promise<{ unseen_count: number }> {
    const unseen_count = await this.notificationRepository.count({
      where: { user_id: userId, is_seen: false },
    });
    return { unseen_count };
  }
}
