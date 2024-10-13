import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { redisConfigType } from 'src/config/redis.config';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly redisConfig;
  constructor(private configService: ConfigService) {
    this.redisConfig = this.configService.get<redisConfigType>('redis');
    this.redis = new Redis(this.redisConfig);
  }

  async setUserSocket(userId: number, socketId: string) {
    await this.redis.set(`user:${userId}`, socketId);
  }

  async getUserSocket(userId: number) {
    return await this.redis.get(`user:${userId}`);
  }

  async removeUserSocket(userId: number) {
    await this.redis.del(`user:${userId}`);
  }
}
