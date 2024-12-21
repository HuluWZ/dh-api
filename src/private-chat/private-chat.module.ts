import { Module } from '@nestjs/common';
import { PrivateChatGateway } from './private-chat.gateway';
import { PrivateChatService } from './private-chat.service';
import { PrivateChatController } from './private-chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { RedisService } from 'src/redis/redis.service';
import { OrgGroupModule } from 'src/org-group/org-group.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [JwtModule, AuthModule, OrgGroupModule, NotificationModule],
  controllers: [PrivateChatController],
  providers: [PrivateChatGateway, PrivateChatService, RedisService],
})
export class PrivateChatModule {}
