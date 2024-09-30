import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { ConfigAppModule } from './config/config.module';
import { MinioModule } from './minio/minio.module';
import { OrgModule } from './org/org.module';
import { OrgInviteModule } from './org-invite/org-invite.module';
import { OrgMemberModule } from './org-member/org-member.module';
import { OrgGroupModule } from './org-group/org-group.module';
import { OrgGroupMembersModule } from './org-group-members/org-group-members.module';
import { TaskModule } from './task/task.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AdminModule } from './admin/admin.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigAppModule,
    AuthModule,
    PrismaModule,
    CommonModule,
    OrgModule,
    OrgInviteModule,
    OrgMemberModule,
    OrgGroupModule,
    MinioModule,
    OrgGroupMembersModule,
    TaskModule,
    CloudinaryModule,
    AdminModule,
    NotificationModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class AppModule {}
