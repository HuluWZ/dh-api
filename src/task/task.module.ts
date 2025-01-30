import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { MinioFileUploadService } from 'src/minio/minio.service';
import { OrgGroupModule } from 'src/org-group/org-group.module';
import { OrgMemberModule } from 'src/org-member/org-member.module';
import { OrgModule } from 'src/org/org.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [AuthModule, JwtModule, OrgModule, OrgGroupModule, OrgMemberModule],
  controllers: [TaskController],
  providers: [TaskService, MinioFileUploadService],
  exports: [TaskService],
})
export class TaskModule {}
