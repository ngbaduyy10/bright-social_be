import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
// import { CacheService } from '../cache/cache.service';

@Module({
  providers: [EmailService],
  // imports: [CacheService],
  exports: [EmailService],
})
export class EmailModule {}
