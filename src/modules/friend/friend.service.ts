import { Injectable } from '@nestjs/common';
import { FriendRepository } from '@/repositories/friend.repository';

@Injectable()
export class FriendService {
  constructor(
    private readonly friendRepository: FriendRepository,
  ) {}

  async getAll(userId: string) {
    return await this.friendRepository.getAll(userId);
  }
}
