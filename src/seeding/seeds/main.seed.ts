import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserEntity } from '@/entities/user.entity';
import { FriendEntity } from '@/entities/friend.entity';
import { PostEntity } from '@/entities/post.entity';
import { SaveEntity } from '@/entities/save.entity';
import { StoryEntity } from '@/entities/story.entity';
import { MediaEntity } from '@/entities/media.entity';
import { LikeEntity } from '@/entities/like.entity';
import { CommentEntity } from '@/entities/comment.entity';
import { NotificationEntity } from '@/entities/notification.entity';
import { hashPassword } from '@/utils/helpers';
import { FriendStatus, NotificationType } from '@/utils/constant';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const friendRepository = dataSource.getRepository(FriendEntity);
    const postRepository = dataSource.getRepository(PostEntity);
    const saveRepository = dataSource.getRepository(SaveEntity);
    const storyRepository = dataSource.getRepository(StoryEntity);
    const mediaRepository = dataSource.getRepository(MediaEntity);
    const likeRepository = dataSource.getRepository(LikeEntity);
    const commentRepository = dataSource.getRepository(CommentEntity);
    const notificationRepository = dataSource.getRepository(NotificationEntity);

    const staticUser = userRepository.create({
      email: 'ngbaduyy05@gmail.com',
      first_name: 'Duy',
      last_name: 'Nguyen',
      username: 'ngbaduyy05',
      password: await hashPassword('123456'),
      gender: null,
      phone: null,
      image: null,
      cover_image: null,
      bio: null,
      is_verified: true,
    });

    await userRepository.save(staticUser);

    // Create 3 posts for the static user using factory
    const postFactory = factoryManager.get(PostEntity);
    const posts: PostEntity[] = [];
    
    for (let i = 0; i < 3; i++) {
      const post = await postFactory.make();
      post.user_id = staticUser.id;
      posts.push(post);
    }

    await postRepository.save(posts);

    // Get all users to use as actors for likes, comments, and notifications
    const allUsersForActions = await userRepository.find();
    const otherUsersForActions = allUsersForActions.filter(user => user.id !== staticUser.id);

    // Create likes, comments, and notifications for each post
    if (otherUsersForActions.length > 0) {
      const likeFactory = factoryManager.get(LikeEntity);
      const commentFactory = factoryManager.get(CommentEntity);
      const allLikes: LikeEntity[] = [];
      const allComments: CommentEntity[] = [];
      const allNotifications: NotificationEntity[] = [];

      for (const post of posts) {
        // Create 10-12 likes for each post
        const numLikes = Math.floor(Math.random() * 3) + 10; // Random between 10-12
        for (let i = 0; i < numLikes; i++) {
          const like = await likeFactory.make();
          const randomActor = otherUsersForActions[Math.floor(Math.random() * otherUsersForActions.length)];
          like.post_id = post.id;
          like.user_id = randomActor.id;
          allLikes.push(like);

          // Create notification for like
          const likeNotification = notificationRepository.create({
            type: NotificationType.LIKE,
            user_id: staticUser.id, // Post owner receives notification
            actor_id: randomActor.id, // User who liked
          });
          allNotifications.push(likeNotification);
        }

        // Create 1-3 comments for each post
        const numComments = Math.floor(Math.random() * 3) + 1; // Random between 1-3
        for (let i = 0; i < numComments; i++) {
          const comment = await commentFactory.make();
          const randomActor = otherUsersForActions[Math.floor(Math.random() * otherUsersForActions.length)];
          comment.post_id = post.id;
          comment.user_id = randomActor.id;
          allComments.push(comment);

          // Create notification for comment
          const commentNotification = notificationRepository.create({
            type: NotificationType.COMMENT,
            user_id: staticUser.id, // Post owner receives notification
            actor_id: randomActor.id, // User who commented
          });
          allNotifications.push(commentNotification);
        }
      }

      await likeRepository.save(allLikes);
      await commentRepository.save(allComments);
      await notificationRepository.save(allNotifications);
    } else {
      console.log('ℹ️ No other users found to create likes, comments, and notifications');
    }

    // Create 2 media items for each post using factory
    const mediaFactory = factoryManager.get(MediaEntity);
    const allMedia: MediaEntity[] = [];

    for (const post of posts) {
      for (let i = 0; i < 2; i++) {
        const media = await mediaFactory.make();
        media.user_id = staticUser.id;
        media.post_id = post.id;
        media.order = i;
        allMedia.push(media);
      }
    }

    await mediaRepository.save(allMedia);

    // Create 2 stories for the static user using factory
    const storyFactory = factoryManager.get(StoryEntity);
    const stories: StoryEntity[] = [];

    for (let i = 0; i < 2; i++) {
      const story = await storyFactory.make();
      story.user_id = staticUser.id;
      stories.push(story);
    }

    await storyRepository.save(stories);

    const allUsers = await userRepository.find();
    const otherUsers = allUsers.filter(user => user.id !== staticUser.id);

    if (otherUsers.length > 0) {
      const friendRelationships: FriendEntity[] = [];

      // Split users into groups
      const acceptedFriends = otherUsers.slice(0, 30);
      const friendRequests = otherUsers.slice(30, 40);
      const sentRequests = otherUsers.slice(40, 45); 

      // Create 30 accepted friendships (bidirectional)
      for (const otherUser of acceptedFriends) {
        const friendship1 = friendRepository.create({
          user_id: staticUser.id,
          friend_id: otherUser.id,
          status: FriendStatus.ACCEPTED,
        });
        friendRelationships.push(friendship1);

        const friendship2 = friendRepository.create({
          user_id: otherUser.id,
          friend_id: staticUser.id,
          status: FriendStatus.ACCEPTED,
        });
        friendRelationships.push(friendship2);
      }

      // Create 10 incoming friend requests (others send to staticUser)
      for (const otherUser of friendRequests) {
        const incomingRequest = friendRepository.create({
          user_id: otherUser.id,
          friend_id: staticUser.id,
          status: FriendStatus.PENDING,
        });
        friendRelationships.push(incomingRequest);
      }

      // Create 5 outgoing sent requests (staticUser sends to others)
      for (const otherUser of sentRequests) {
        const sentRequest = friendRepository.create({
          user_id: staticUser.id,
          friend_id: otherUser.id,
          status: FriendStatus.PENDING,
        });
        friendRelationships.push(sentRequest);
      }

      await friendRepository.save(friendRelationships);
    } else {
      console.log('ℹ️ No other users found to create friendships with');
    }

    const allPosts = await postRepository.find({ take:  7});

    if (allPosts.length > 0) {
      const savedPosts: SaveEntity[] = [];
      const postsToSave = allPosts.slice(0, Math.min(7, allPosts.length));

      for (const post of postsToSave) {
        const savePost = saveRepository.create({
          user_id: staticUser.id,
          post_id: post.id,
        });
        savedPosts.push(savePost);
      }

      await saveRepository.save(savedPosts);
    } else {
      console.log('ℹ️ No posts found to save');
    }
  }
}
