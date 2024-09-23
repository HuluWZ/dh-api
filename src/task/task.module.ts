import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OrgModule } from 'src/org/org.module';
import { OrgGroupModule } from 'src/org-group/org-group.module';
import { OrgMemberModule } from 'src/org-member/org-member.module';

@Module({
  imports: [AuthModule, JwtModule, OrgModule, OrgGroupModule, OrgMemberModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
