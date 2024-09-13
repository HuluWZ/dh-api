import { Module } from '@nestjs/common';
import { OrgGroupMembersController } from './org-group-members.controller';
import { OrgGroupMembersService } from './org-group-members.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OrgModule } from 'src/org/org.module';
import { OrgMemberModule } from 'src/org-member/org-member.module';
import { OrgGroupModule } from 'src/org-group/org-group.module';

@Module({
  imports: [AuthModule, JwtModule, OrgModule, OrgMemberModule, OrgGroupModule],
  controllers: [OrgGroupMembersController],
  providers: [OrgGroupMembersService],
})
export class OrgGroupMembersModule {}
