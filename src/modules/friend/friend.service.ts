import { Injectable } from '@nestjs/common';
import { FriendRepository } from '@/repositories/friend.repository';
import { UserRepository } from '@/repositories/user.repository';
import { ResponseFriendDto } from './dto/responseFriend.dto';
import { ResponseSuggestedUserDto } from './dto/responseSuggestedUser.dto';

@Injectable()
export class FriendService {
  constructor(
    private readonly friendRepository: FriendRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<ResponseFriendDto[]>> {
    const { friends, total } = await this.friendRepository.getPaginatedFriends(userId, page, limit);
    
    const friendIds = friends.map(friend => friend.friend_id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, friendIds);
  
    const friendsWithMutualCount: ResponseFriendDto[] = friends.map((friend) => ({
      ...friend,
      mutual: mutualFriendsCountMap.get(friend.friend_id) || 0,
    }));
    
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: friendsWithMutualCount, meta };
  }

  async getFriendRequests(userId: string, page: number, limit: number): Promise<PaginatedResponse<ResponseFriendDto[]>> {
    const { friendRequests, total } = await this.friendRepository.getFriendRequests(userId, page, limit);
    
    const requestUserIds = friendRequests.map(request => request.user_id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, requestUserIds);
  
    const friendRequestsWithMutualCount: ResponseFriendDto[] = friendRequests.map((request) => ({
      ...request,
      mutual: mutualFriendsCountMap.get(request.user_id) || 0,
    }));
    
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: friendRequestsWithMutualCount, meta };
  }

  async getSentRequests(userId: string, page: number, limit: number): Promise<PaginatedResponse<ResponseFriendDto[]>> {
    const { sentRequests, total } = await this.friendRepository.getSentRequests(userId, page, limit);
    
    const sentFriendIds = sentRequests.map(request => request.friend_id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, sentFriendIds);
  
    const sentRequestsWithMutualCount: ResponseFriendDto[] = sentRequests.map((request) => ({
      ...request,
      mutual: mutualFriendsCountMap.get(request.friend_id) || 0,
    }));
    
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    
    return { data: sentRequestsWithMutualCount, meta };
  }

  async getSuggestedFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<ResponseSuggestedUserDto[]>> {
    const relatedUserIds = await this.friendRepository.getUsersWithRelationship(userId);
    const excludeUserIds = [...relatedUserIds, userId];

    const allUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id NOT IN (:...excludeUserIds)', { excludeUserIds: excludeUserIds.length > 0 ? excludeUserIds : [''] })
      .getMany();

    if (allUsers.length === 0) {
      const meta: PaginationMeta = {
        page,
        limit,
        total: 0,
        totalPages: 0,
      };
      return { data: [], meta };
    }

    const suggestedUserIds = allUsers.map(user => user.id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, suggestedUserIds);

    const usersWithMutualCount: ResponseSuggestedUserDto[] = allUsers
      .map((user) => ({
        ...user,
        mutual: mutualFriendsCountMap.get(user.id) || 0,
      }))
      .sort((a, b) => b.mutual - a.mutual);

    const total = usersWithMutualCount.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = usersWithMutualCount.slice(skip, skip + limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { data: paginatedUsers, meta };
  }
}
