import { Injectable } from '@nestjs/common';
import { MediaRepository } from '@/repositories/media.repository';
import { MediaEntity } from '@/entities/media.entity';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async getMediaByUser(userId: string, page: number, limit: number): Promise<PaginatedResponse<MediaEntity[]>> {
    const { media, total } = await this.mediaRepository.getMediaByUser(userId, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return { data: media, meta };
  }
}
