import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [SessionController],
  providers: [SessionService, RedisService],
  exports: [SessionService],
})
export class SessionModule {}
