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
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_JWT_SECRET,
      signOptions: { expiresIn: process.env.AUTH_JWT_EXPIRATION },
    }),
    JwtModule.register({
      secret: process.env.REFRESH_JWT_SECRET,
      signOptions: { expiresIn: process.env.REFRESH_JWT_EXPIRATION },
    }),
    AuthModule,
    OrgGroupModule,
    NotificationModule,
  ],
  controllers: [PrivateChatController],
  providers: [PrivateChatGateway, PrivateChatService, RedisService],
})
export class PrivateChatModule {}
