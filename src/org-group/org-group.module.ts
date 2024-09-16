import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { OrgModule } from 'src/org/org.module';
import { OrgGroupService } from './org-group.service';
import { OrgGroupController } from './org-group.controller';

@Module({
  imports: [AuthModule, JwtModule, OrgModule],
  controllers: [OrgGroupController],
  providers: [OrgGroupService],
  exports: [OrgGroupService],
})
export class OrgGroupModule {}
