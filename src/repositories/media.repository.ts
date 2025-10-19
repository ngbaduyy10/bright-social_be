import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MediaEntity } from '@/entities/media.entity';

@Injectable()
export class MediaRepository extends Repository<MediaEntity> {
  constructor(private dataSource: DataSource) {
    super(MediaEntity, dataSource.createEntityManager());
  }

  async getMediaByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [media, total] = await this
      .createQueryBuilder('media')
      .where('media.user_id = :userId', { userId })
      .orderBy('media.created_at', 'DESC')
      .addOrderBy('media.order', 'ASC')
      .addOrderBy('media.id', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    return { media, total };
  }
}
