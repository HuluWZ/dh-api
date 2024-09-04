import { Module } from '@nestjs/common';
import { OrgInviteService } from './org-invite.service';
import { OrgInviteController } from './org-invite.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { OrgModule } from 'src/org/org.module';

@Module({
  imports: [AuthModule, JwtModule, OrgModule],
  providers: [OrgInviteService],
  controllers: [OrgInviteController],
})
export class OrgInviteModule {}
