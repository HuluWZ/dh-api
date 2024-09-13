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
  ],
})
export class AppModule {}
