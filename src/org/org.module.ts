import { forwardRef, Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OrgMemberModule } from 'src/org-member/org-member.module';
import { OrgGroupModule } from 'src/org-group/org-group.module';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    OrgMemberModule,
    forwardRef(() => OrgGroupModule), // Use forwardRef() if there is a circular dependency
  ],
  controllers: [OrgController],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule {}
