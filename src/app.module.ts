import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database';
import { Repositories } from './repositories/index.repository';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './config/cache';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FriendModule } from './modules/friend/friend.module';
import { PostModule } from './modules/post/post.module';
import { StoryModule } from './modules/story/story.module';
import { PageModule } from './modules/page/page.module';
import { MediaModule } from './modules/media/media.module';

@Global()
@Module({
  controllers: [AppController],
  providers: [
    ...Repositories,
    CacheService,
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    }
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: configService.get<number>('REDIS_PORT') || 6379,
        ttl: configService.get<number>('CACHE_TTL') || 3600000,
      }),
    }),
    UserModule,
    AuthModule,
    FriendModule,
    PostModule,
    StoryModule,
    PageModule,
    MediaModule,
  ],
  exports: [
    ...Repositories,
    CacheService,
  ],
})
export class AppModule {}
