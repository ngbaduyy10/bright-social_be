import { FriendEntity } from '@/entities/friend.entity';
import { setSeederFactory } from 'typeorm-extension';
import { FriendStatus } from '@/utils/constant';

export default setSeederFactory(FriendEntity, async (): Promise<FriendEntity> => {
  const friend = new FriendEntity();
  friend.status = FriendStatus.ACCEPTED;
  return friend;
});
