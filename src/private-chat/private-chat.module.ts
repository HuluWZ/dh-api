import { Module } from '@nestjs/common';
import { PrivateChatGateway } from './private-chat.gateway';
import { PrivateChatService } from './private-chat.service';
import { PrivateChatController } from './private-chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [PrivateChatController],
  providers: [PrivateChatGateway, PrivateChatService, RedisService],
})
export class PrivateChatModule {}
