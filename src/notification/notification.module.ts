import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { OrgGroupModule } from 'src/org-group/org-group.module';

@Module({
  imports: [AuthModule, JwtModule, OrgGroupModule],
  providers: [NotificationService],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
