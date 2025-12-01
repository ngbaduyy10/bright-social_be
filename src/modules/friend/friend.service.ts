import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FriendRepository } from '@/repositories/friend.repository';
import { UserRepository } from '@/repositories/user.repository';
import { NotificationRepository } from '@/repositories/notification.repository';
import { NotificationGateway } from '../socket/notification.gateway';
import { ResponseSuggestedUserDto } from './dto/responseSuggestedUser.dto';
import { FriendEntity } from '@/entities/friend.entity';
import { FriendStatus, NotificationType } from '@/utils/constant';

@Injectable()
export class FriendService {
  constructor(
    private readonly friendRepository: FriendRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async getFriends(userId: string, page: number, limit: number): Promise<PaginatedResponse<FriendEntity[]>> {
    const { friends, total } = await this.friendRepository.getPaginatedFriends(userId, page, limit);
    
    const friendIds = friends.map(friend => friend.friend_id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, friendIds);
  
    const friendsWithMutualCount: FriendEntity[] = friends.map((friend) => ({
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

  async getFriendRequests(userId: string, page: number, limit: number): Promise<PaginatedResponse<FriendEntity[]>> {
    const { friendRequests, total } = await this.friendRepository.getFriendRequests(userId, page, limit);
    
    const requestUserIds = friendRequests.map(request => request.user_id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, requestUserIds);
  
    const friendRequestsWithMutualCount: FriendEntity[] = friendRequests.map((request) => ({
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

  async getSentRequests(userId: string, page: number, limit: number): Promise<PaginatedResponse<FriendEntity[]>> {
    const { sentRequests, total } = await this.friendRepository.getSentRequests(userId, page, limit);
    
    const sentFriendIds = sentRequests.map(request => request.friend_id);
    const mutualFriendsCountMap = await this.friendRepository.getMutualFriendsCountBatch(userId, sentFriendIds);
  
    const sentRequestsWithMutualCount: FriendEntity[] = sentRequests.map((request) => ({
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

  async sendRequest(userId: string, friendId: string): Promise<FriendEntity> {
    if (userId === friendId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const friend = await this.userRepository.findOne({ where: { id: friendId } });
    if (!friend) {
      throw new NotFoundException('User not found');
    }

    const existingRelationship = await this.friendRepository.findOne({
      where: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
      ],
    });

    if (existingRelationship) {
      if (existingRelationship.status === FriendStatus.ACCEPTED) {
        throw new BadRequestException('Already friends');
      }
      if (existingRelationship.status === FriendStatus.PENDING) {
        if (existingRelationship.user_id === userId) {
          throw new BadRequestException('Friend request already sent');
        } else {
          throw new BadRequestException('Friend request already received');
        }
      }
    }

    const friendRequest = this.friendRepository.create({
      user_id: userId,
      friend_id: friendId,
      status: FriendStatus.PENDING,
    });

    const savedRequest = await this.friendRepository.save(friendRequest);

    const notification = this.notificationRepository.create({
      type: NotificationType.ADD_FRIEND,
      user_id: friendId,
      actor_id: userId,
      is_seen: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    const notificationWithRelations = await this.notificationRepository.findOne({
      where: { id: savedNotification.id },
      relations: ['actor'],
    });

    if (notificationWithRelations) {
      this.notificationGateway.sendNotification(friendId, notificationWithRelations);
    }

    return await this.friendRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['friend'],
    });
  }

  async cancelRequest(userId: string, friendId: string): Promise<void> {
    const friendRequest = await this.friendRepository.findOne({
      where: {
        user_id: userId,
        friend_id: friendId,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    await this.friendRepository.remove(friendRequest);
  }

  async acceptRequest(userId: string, friendId: string): Promise<FriendEntity> {
    const incomingRequest = await this.friendRepository.findOne({
      where: {
        user_id: friendId,
        friend_id: userId,
        status: FriendStatus.PENDING,
      },
    });

    if (!incomingRequest) {
      throw new NotFoundException('Friend request not found');
    }

    incomingRequest.status = FriendStatus.ACCEPTED;
    await this.friendRepository.save(incomingRequest);

    const reverseRelationship = await this.friendRepository.findOne({
      where: {
        user_id: userId,
        friend_id: friendId,
      },
    });

    if (reverseRelationship) {
      reverseRelationship.status = FriendStatus.ACCEPTED;
      await this.friendRepository.save(reverseRelationship);
    } else {
      const newRelationship = this.friendRepository.create({
        user_id: userId,
        friend_id: friendId,
        status: FriendStatus.ACCEPTED,
      });
      await this.friendRepository.save(newRelationship);
    }

    const notification = this.notificationRepository.create({
      type: NotificationType.ACCEPT_FRIEND,
      user_id: friendId,
      actor_id: userId,
      is_seen: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    const notificationWithRelations = await this.notificationRepository.findOne({
      where: { id: savedNotification.id },
      relations: ['actor'],
    });

    if (notificationWithRelations) {
      this.notificationGateway.sendNotification(friendId, notificationWithRelations);
    }

    return await this.friendRepository.findOne({
      where: { id: incomingRequest.id },
      relations: ['user'],
    });
  }

  async rejectRequest(userId: string, friendId: string): Promise<void> {
    const friendRequest = await this.friendRepository.findOne({
      where: {
        user_id: friendId,
        friend_id: userId,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    await this.friendRepository.remove(friendRequest);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship1 = await this.friendRepository.findOne({
      where: {
        user_id: userId,
        friend_id: friendId,
        status: FriendStatus.ACCEPTED,
      },
    });

    const friendship2 = await this.friendRepository.findOne({
      where: {
        user_id: friendId,
        friend_id: userId,
        status: FriendStatus.ACCEPTED,
      },
    });

    if (!friendship1 && !friendship2) {
      throw new NotFoundException('Friendship not found');
    }

    if (friendship1) {
      await this.friendRepository.remove(friendship1);
    }
    if (friendship2) {
      await this.friendRepository.remove(friendship2);
    }
  }
}
