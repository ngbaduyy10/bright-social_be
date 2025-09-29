import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
<<<<<<< HEAD
// import { CacheService } from '../cache/cache.service';

@Module({
  providers: [EmailService],
  // imports: [CacheService],
=======

@Module({
  providers: [EmailService],
>>>>>>> origin/feature/email-verification
  exports: [EmailService],
})
export class EmailModule {}
