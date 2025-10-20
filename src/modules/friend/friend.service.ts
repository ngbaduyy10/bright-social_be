import { Injectable } from '@nestjs/common';
import { FriendRepository } from '@/repositories/friend.repository';
import { FriendEntity } from '@/entities/friend.entity';

@Injectable()
export class FriendService {
  constructor(
    private readonly friendRepository: FriendRepository,
  ) {}

  async getFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<FriendEntity[]>> {
    const { friends, total } = await this.friendRepository.getPaginatedFriends(userId, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: friends, meta };
  }

  async getFriendRequests(userId: string, page: number, limit: number): Promise<PaginatedResponse<FriendEntity[]>> {
    const { friendRequests, total } = await this.friendRepository.getFriendRequests(userId, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: friendRequests, meta };
  }

  async getSentRequests(userId: string, page: number, limit: number): Promise<PaginatedResponse<FriendEntity[]>> {
    const { sentRequests, total } = await this.friendRepository.getSentRequests(userId, page, limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return { data: sentRequests, meta };
  }
}
