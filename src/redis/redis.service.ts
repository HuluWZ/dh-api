import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { randomBytes } from 'node:crypto';
import { redisConfigType } from 'src/config/redis.config';
import { Session, USER_SESSION_TIMEOUT_IN_SECONDS } from './redis.interface';

function generateShortSessionId(): string {
  return randomBytes(4).toString('hex');
}

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
  // Manage group memberships
  async addUserToGroup(userId: number, groupId: number) {
    await this.redis.sadd(`group:${groupId}`, userId.toString());
  }

  async getGroupMembers(groupId: number) {
    return await this.redis.smembers(`group:${groupId}`);
  }

  async removeUserFromGroup(userId: number, groupId: number) {
    await this.redis.srem(`group:${groupId}`, userId.toString());
  }

  async getUserGroups(userId: number) {
    return await this.redis.smembers(`user_groups:${userId}`);
  }

  async addUserGroup(userId: number, groupId: string) {
    await this.redis.sadd(`user_groups:${userId}`, groupId);
  }

  async createUserSession(
    userId: string,
    platform: string,
    device_id: string,
    model?: string,
    ip?: string,
  ) {
    const sessionId = generateShortSessionId();
    const sessionKey = `user_sessions:${userId}:${sessionId}`;

    const sessionData: Session = {
      user_id: userId,
      created_at: Date.now(),
      platform,
      model,
      device_id,
      ip,
    };

    await this.redis.hset(sessionKey, sessionData);

    await this.redis.expire(sessionKey, USER_SESSION_TIMEOUT_IN_SECONDS);

    return sessionId;
  }
  async getUserSession({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: string;
  }): Promise<Record<string, string> | null> {
    const sessionKey = `user_sessions:${userId}:${sessionId}`;
    const sessionData = await this.redis.hgetall(sessionKey);

    if (Object.keys(sessionData).length === 0) {
      return null;
    }
    return sessionData;
  }

  async getUserSessions(userId: string): Promise<string[]> {
    return await this.redis.keys(`user_sessions:${userId}:*`);
  }

  async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    const sessionKey = `user_sessions:${userId}:${sessionId}`;
    await this.redis.del(sessionKey);
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const keys = await this.getUserSessions(userId);
      const formattedKeys = keys.map((k) => `user_sessions:${userId}:${k}`);
      await this.redis.del(formattedKeys);
    } catch (error) {
      console.error(error);
    }
  }
}
