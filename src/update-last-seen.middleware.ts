import { Injectable, NestMiddleware } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UpdateLastSeenMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: any, res: any, next: () => void) {
    const user = req.user;
    if (user) {
      await this.redisService.setLastSeen(user.id, new Date().toISOString());
    }
    next();
  }
}
