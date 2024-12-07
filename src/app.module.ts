import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { ConfigAppModule } from './config/config.module';
import { OrgModule } from './org/org.module';
import { OrgInviteModule } from './org-invite/org-invite.module';
import { OrgMemberModule } from './org-member/org-member.module';
import { OrgGroupModule } from './org-group/org-group.module';
import { OrgGroupMembersModule } from './org-group-members/org-group-members.module';
import { TaskModule } from './task/task.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notification/notification.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrivateChatModule } from './private-chat/private-chat.module';
import { RedisService } from './redis/redis.service';
import { SessionModule } from './session/session.module';
import { ContactModule } from './contact/contact.module';
import { UpdateLastSeenMiddleware } from './update-last-seen.middleware';
import { AdvertisementModule } from './advertisement/advertisement.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 45, // 45 requests
      },
    ]),
    ConfigAppModule,
    AuthModule,
    PrismaModule,
    CommonModule,
    OrgModule,
    OrgInviteModule,
    OrgMemberModule,
    OrgGroupModule,
    OrgGroupMembersModule,
    TaskModule,
    CloudinaryModule,
    AdminModule,
    NotificationModule,
    PrivateChatModule,
    SessionModule,
    ContactModule,
    AdvertisementModule,
  ],
  controllers: [],
  providers: [RedisService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UpdateLastSeenMiddleware).forRoutes('*');
  }
}
