import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserEntity } from '@/entities/user.entity';
import { FriendEntity } from '@/entities/friend.entity';
import { PostEntity } from '@/entities/post.entity';
import { SaveEntity } from '@/entities/save.entity';
import { StoryEntity } from '@/entities/story.entity';
import { MediaEntity } from '@/entities/media.entity';
import { hashPassword } from '@/utils/helpers';
import { FriendStatus } from '@/utils/constant';

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

      for (const otherUser of otherUsers) {
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
