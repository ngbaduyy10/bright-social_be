import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { PostEntity } from '@/entities/post.entity';
import { UserEntity } from '@/entities/user.entity';
import { LikeEntity } from '@/entities/like.entity';
import { CommentEntity } from '@/entities/comment.entity';

export default class PostSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const postRepository = dataSource.getRepository(PostEntity);
    const userRepository = dataSource.getRepository(UserEntity);
    const likeRepository = dataSource.getRepository(LikeEntity);
    const commentRepository = dataSource.getRepository(CommentEntity);
    const postFactory = factoryManager.get(PostEntity);
    const likeFactory = factoryManager.get(LikeEntity);
    const commentFactory = factoryManager.get(CommentEntity);

    const users = await userRepository.find();
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please run user seeder first.');
      return;
    }

    const posts = [];
    for (const user of users) {
      const postCount = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < postCount; i++) {
        const post = await postFactory.make();
        post.user_id = user.id;
        posts.push(post);
      }
    }

    await postRepository.save(posts);
    
    // Create likes and comments for each post
    const allLikes: LikeEntity[] = [];
    const allComments: CommentEntity[] = [];
    
    for (const post of posts) {
      // Create 5-10 likes for each post
      const likeCount = Math.floor(Math.random() * 6) + 5; // 5-10 likes
      const maxLikes = Math.min(likeCount, users.length); // Don't exceed available users
      const likedUserIds = new Set<string>();
      
      for (let i = 0; i < maxLikes; i++) {
        // Select a random user who hasn't liked this post yet
        let randomUser;
        let attempts = 0;
        do {
          randomUser = users[Math.floor(Math.random() * users.length)];
          attempts++;
          if (attempts > 100) break; // Safety break to prevent infinite loop
        } while (likedUserIds.has(randomUser.id));
        
        if (!likedUserIds.has(randomUser.id)) {
          likedUserIds.add(randomUser.id);
          const like = await likeFactory.make();
          like.post_id = post.id;
          like.user_id = randomUser.id;
          allLikes.push(like);
        }
      }
      
      // Create 1-4 comments for each post
      const commentCount = Math.floor(Math.random() * 4) + 1; // 1-4 comments
      
      for (let i = 0; i < commentCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const comment = await commentFactory.make();
        comment.post_id = post.id;
        comment.user_id = randomUser.id;
        allComments.push(comment);
      }
    }
    
    await likeRepository.save(allLikes);
    await commentRepository.save(allComments);
    
    console.log(`✅ ${posts.length} posts created successfully for ${users.length} users!`);
    console.log(`✅ ${allLikes.length} likes created for posts!`);
    console.log(`✅ ${allComments.length} comments created for posts!`);
  }
}
