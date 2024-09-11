import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { OrgMemberController } from 'src/org-member/org-member.controller';
import { OrgMemberService } from 'src/org-member/org-member.service';
import { OrgModule } from 'src/org/org.module';

@Module({
  imports: [AuthModule, JwtModule, OrgModule],
  controllers: [OrgMemberController],
  providers: [OrgMemberService],
  exports: [OrgMemberService],
})
export class OrgGroupModule {}
