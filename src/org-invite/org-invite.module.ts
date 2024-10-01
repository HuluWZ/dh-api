import { Module } from '@nestjs/common';
import { OrgInviteService } from './org-invite.service';
import { OrgInviteController } from './org-invite.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { OrgModule } from 'src/org/org.module';
import { OrgMemberModule } from 'src/org-member/org-member.module';
import { NotificationModule } from 'src/notification/notification.module';
import { DeviceModule } from 'src/common/device/device.module';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    OrgModule,
    OrgMemberModule,
    NotificationModule,
    DeviceModule,
  ],
  providers: [OrgInviteService],
  controllers: [OrgInviteController],
})
export class OrgInviteModule {}
