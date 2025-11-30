import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationEntity } from '@/entities/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<NotificationEntity> {
  constructor(private dataSource: DataSource) {
    super(NotificationEntity, dataSource.createEntityManager());
  }

  async getNotificationsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.findAndCount({
      where: { user_id: userId },
      relations: ['actor', 'post'],
      order: { created_at: 'DESC', id: 'DESC' },
      skip,
      take: limit,
    });

    return { notifications, total };
  }
}

