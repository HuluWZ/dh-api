import { forwardRef, Module } from '@nestjs/common';
import { OrgMemberController } from './org-member.controller';
import { OrgMemberService } from './org-member.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OrgModule } from 'src/org/org.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    forwardRef(() => OrgModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [OrgMemberController],
  providers: [OrgMemberService],
  exports: [OrgMemberService],
})
export class OrgMemberModule {}
