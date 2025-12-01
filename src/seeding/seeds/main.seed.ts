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
import { ConversationEntity } from '@/entities/conversation.entity';
import { MessageEntity } from '@/entities/message.entity';
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
    const conversationRepository = dataSource.getRepository(ConversationEntity);
    const messageRepository = dataSource.getRepository(MessageEntity);

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

    const staticUser2 = userRepository.create({
      email: 'ngbaduyy10@gmail.com',
      first_name: 'Ba',
      last_name: 'Duy',
      username: 'ngbaduyy10',
      password: await hashPassword('123456'),
      gender: null,
      phone: null,
      image: null,
      cover_image: null,
      bio: null,
      is_verified: true,
    });

    await userRepository.save(staticUser2);

    // Create 3 posts for the static user using factory
    const postFactory = factoryManager.get(PostEntity);
    const posts: PostEntity[] = [];
    
    for (let i = 0; i < 3; i++) {
      const post = await postFactory.make();
      post.user_id = staticUser.id;
      posts.push(post);
    }

    await postRepository.save(posts);

    // Create 3 posts for the static user 2 using factory
    const posts2: PostEntity[] = [];
    
    for (let i = 0; i < 3; i++) {
      const post = await postFactory.make();
      post.user_id = staticUser2.id;
      posts2.push(post);
    }

    await postRepository.save(posts2);

    // Get all users to use as actors for likes, comments, and notifications
    const allUsersForActions = await userRepository.find();
    const otherUsersForActions = allUsersForActions.filter(user => user.id !== staticUser.id && user.id !== staticUser2.id);

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
          const isSeen = Math.random() > 0.5; // Random true/false
          const likeNotification = notificationRepository.create({
            type: NotificationType.LIKE,
            user_id: staticUser.id, // Post owner receives notification
            actor_id: randomActor.id, // User who liked
            is_seen: isSeen,
            seen_at: isSeen ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Random date within last 7 days if seen
            post_id: post.id,
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
          const isSeen = Math.random() > 0.5; // Random true/false
          const commentNotification = notificationRepository.create({
            type: NotificationType.COMMENT,
            user_id: staticUser.id, // Post owner receives notification
            actor_id: randomActor.id, // User who commented
            is_seen: isSeen,
            seen_at: isSeen ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Random date within last 7 days if seen
            content: comment.content,
            post_id: post.id,
          });
          allNotifications.push(commentNotification);
        }
      }

      // Create likes, comments, and notifications for staticUser2 posts
      for (const post of posts2) {
        // Create 10-12 likes for each post
        const numLikes = Math.floor(Math.random() * 3) + 10; // Random between 10-12
        for (let i = 0; i < numLikes; i++) {
          const like = await likeFactory.make();
          const randomActor = otherUsersForActions[Math.floor(Math.random() * otherUsersForActions.length)];
          like.post_id = post.id;
          like.user_id = randomActor.id;
          allLikes.push(like);

          // Create notification for like
          const isSeen = Math.random() > 0.5; // Random true/false
          const likeNotification = notificationRepository.create({
            type: NotificationType.LIKE,
            user_id: staticUser2.id, // Post owner receives notification
            actor_id: randomActor.id, // User who liked
            is_seen: isSeen,
            seen_at: isSeen ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Random date within last 7 days if seen
            post_id: post.id,
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
          const isSeen = Math.random() > 0.5; // Random true/false
          const commentNotification = notificationRepository.create({
            type: NotificationType.COMMENT,
            user_id: staticUser2.id, // Post owner receives notification
            actor_id: randomActor.id, // User who commented
            is_seen: isSeen,
            seen_at: isSeen ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Random date within last 7 days if seen
            content: comment.content,
            post_id: post.id,
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

    // Create 2 media items for each post2 using factory
    for (const post of posts2) {
      for (let i = 0; i < 2; i++) {
        const media = await mediaFactory.make();
        media.user_id = staticUser2.id;
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

    // Create 2 stories for the static user 2 using factory
    const stories2: StoryEntity[] = [];

    for (let i = 0; i < 2; i++) {
      const story = await storyFactory.make();
      story.user_id = staticUser2.id;
      stories2.push(story);
    }

    await storyRepository.save(stories2);

    const allUsers = await userRepository.find();
    const otherUsers = allUsers.filter(user => user.id !== staticUser.id && user.id !== staticUser2.id);

    if (otherUsers.length > 0) {
      const friendRelationships: FriendEntity[] = [];
      const friendRequestNotifications: NotificationEntity[] = [];

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
      for (let i = 0; i < friendRequests.length; i++) {
        const otherUser = friendRequests[i];
        const incomingRequest = friendRepository.create({
          user_id: otherUser.id,
          friend_id: staticUser.id,
          status: FriendStatus.PENDING,
        });
        friendRelationships.push(incomingRequest);

        // Create notification for friend request
        // Only first 8 notifications are unseen, rest are seen
        const isSeen = i >= 8;
        const friendRequestNotification = notificationRepository.create({
          type: NotificationType.ADD_FRIEND,
          user_id: staticUser.id, // staticUser receives notification
          actor_id: otherUser.id, // User who sent friend request
          is_seen: isSeen,
          seen_at: isSeen ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Random date within last 7 days if seen
        });
        friendRequestNotifications.push(friendRequestNotification);
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
      await notificationRepository.save(friendRequestNotifications);

      // Create friend relationships for staticUser2
      const friendRelationships2: FriendEntity[] = [];
      const friendRequestNotifications2: NotificationEntity[] = [];

      // Split users into groups for staticUser2
      const acceptedFriends2 = otherUsers.slice(0, 30);
      const friendRequests2 = otherUsers.slice(30, 40);
      const sentRequests2 = otherUsers.slice(40, 45); 

      // Create 30 accepted friendships (bidirectional) for staticUser2
      for (const otherUser of acceptedFriends2) {
        const friendship1 = friendRepository.create({
          user_id: staticUser2.id,
          friend_id: otherUser.id,
          status: FriendStatus.ACCEPTED,
        });
        friendRelationships2.push(friendship1);

        const friendship2 = friendRepository.create({
          user_id: otherUser.id,
          friend_id: staticUser2.id,
          status: FriendStatus.ACCEPTED,
        });
        friendRelationships2.push(friendship2);
      }

      // Create 10 incoming friend requests (others send to staticUser2)
      for (let i = 0; i < friendRequests2.length; i++) {
        const otherUser = friendRequests2[i];
        const incomingRequest = friendRepository.create({
          user_id: otherUser.id,
          friend_id: staticUser2.id,
          status: FriendStatus.PENDING,
        });
        friendRelationships2.push(incomingRequest);

        // Create notification for friend request
        // Only first 8 notifications are unseen, rest are seen
        const isSeen = i >= 8;
        const friendRequestNotification = notificationRepository.create({
          type: NotificationType.ADD_FRIEND,
          user_id: staticUser2.id, // staticUser2 receives notification
          actor_id: otherUser.id, // User who sent friend request
          is_seen: isSeen,
          seen_at: isSeen ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Random date within last 7 days if seen
        });
        friendRequestNotifications2.push(friendRequestNotification);
      }

      // Create 5 outgoing sent requests (staticUser2 sends to others)
      for (const otherUser of sentRequests2) {
        const sentRequest = friendRepository.create({
          user_id: staticUser2.id,
          friend_id: otherUser.id,
          status: FriendStatus.PENDING,
        });
        friendRelationships2.push(sentRequest);
      }

      await friendRepository.save(friendRelationships2);
      await notificationRepository.save(friendRequestNotifications2);
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

      // Create saved posts for staticUser2
      const savedPosts2: SaveEntity[] = [];
      const postsToSave2 = allPosts.slice(0, Math.min(7, allPosts.length));

      for (const post of postsToSave2) {
        const savePost = saveRepository.create({
          user_id: staticUser2.id,
          post_id: post.id,
        });
        savedPosts2.push(savePost);
      }

      await saveRepository.save(savedPosts2);
    } else {
      console.log('ℹ️ No posts found to save');
    }

    // Create conversation between staticUser and staticUser2
    const [user1Id, user2Id] = [staticUser.id, staticUser2.id].sort();
    const conversation = conversationRepository.create({
      user1_id: user1Id,
      user2_id: user2Id,
      last_message_id: null,
    });

    const savedConversation = await conversationRepository.save(conversation);

    // Create 10 messages between the two users
    const messages: MessageEntity[] = [];
    const messageContents: string[] = [
      'Hello!',
      'Hi there!',
      'How are you?',
      'I\'m doing well, thanks!',
      'The weather is nice today, isn\'t it?',
      'Yes, it\'s beautiful outside!',
      'Are you free?',
      'Yes, I\'m available',
      'Want to grab coffee?',
      'OK, see you later!',
    ];

    // Create base timestamp (2 hours ago, so messages appear in the past)
    const baseTimestamp = Date.now() - (2 * 60 * 60 * 1000);
    // Each message will be spaced 1-3 minutes apart
    const timeBetweenMessages = 60 * 1000; // 1 minute in milliseconds

    for (let i = 0; i < 10; i++) {
      const senderId = i % 2 === 0 ? staticUser.id : staticUser2.id;
      // Calculate created_at: each message is sent progressively later
      const messageCreatedAt = new Date(baseTimestamp + (i * timeBetweenMessages));
      
      const message = messageRepository.create({
        conversation_id: savedConversation.id,
        sender_id: senderId,
        content: messageContents[i],
        is_seen: i < 9 ? Math.random() > 0.3 : false, // Some messages are seen, last one is not seen
        seen_at: i < 9 && Math.random() > 0.3 
          ? new Date(messageCreatedAt.getTime() + 30 * 1000) // Seen 30 seconds after sent
          : null,
        created_at: messageCreatedAt,
        updated_at: messageCreatedAt,
      });
      messages.push(message);
    }

    await messageRepository.save(messages);

    // Update conversation with last message
    const lastMessage = messages[messages.length - 1];
    await conversationRepository.update(savedConversation.id, {
      last_message_id: lastMessage.id,
    });
  }
}
