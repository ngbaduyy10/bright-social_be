import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async execute<T>(...args: unknown[]) {
    const fn: any = args.pop();
    const keys: any = args;

    let key = this.configService.get<string>('PREFIX_CACHE') || '';
    keys.forEach((char: string) => (key += char + '_'));

    let value = await this.cacheManager.get(key);
    if (!value || JSON.stringify(value) === '{}') {
      value = await fn();
      if (value) {
        await this.cacheManager.set(key, value);
      }
    }
    return value as T;
  }

  async removeKey(...args: unknown[]) {
    const keys: any = args;
    let key = this.configService.get<string>('PREFIX_CACHE') || '';

    keys.forEach((char: string) => (key += char + '_'));
    await this.cacheManager.del(key);
    this.cacheManager.store.keys('*' + key + '*').then((keys) => {
      keys.forEach((key) => {
        this.cacheManager.del(key).catch();
      });
    });
  }

  async set(key: string, value: any, ttl?: number) {
    await this.cacheManager.set(key, value, ttl);
  }

  get(key: string) {
    return this.cacheManager.get(key);
  }

  async clearAll() {
    await this.cacheManager.reset();
  }

  async delete(...args: unknown[]) {
    return this.removeKey(...args);
  }
}
