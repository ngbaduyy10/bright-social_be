import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { databaseConfig } from '../config/database';
import UserSeeder from './seeds/user.seed';
import UserFactory from './factories/user.factory';
import PostSeeder from './seeds/post.seed';
import PostFactory from './factories/post.factory';
import StorySeeder from './seeds/story.seed';
import StoryFactory from './factories/story.factory';
import FriendSeeder from './seeds/friend.seed';
import FriendFactory from './factories/friend.factory';
import MediaSeeder from './seeds/media.seed';
import MediaFactory from './factories/media.factory';
import LikeFactory from './factories/like.factory';
import CommentFactory from './factories/comment.factory';
import MainSeeder from './seeds/main.seed';

(async () => {
    const options: DataSourceOptions & SeederOptions = {
        ...databaseConfig,
        dropSchema: true,
        synchronize: true,
        seeds: [UserSeeder, PostSeeder, MediaSeeder, StorySeeder, FriendSeeder, MainSeeder],
        factories: [UserFactory, PostFactory, MediaFactory, StoryFactory, FriendFactory, LikeFactory, CommentFactory]
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    console.log('🌱 Starting database seeding...');
    await runSeeders(dataSource);
    console.log('🎉 Database seeding completed!');
    
    await dataSource.destroy();
})();