import { Module } from '@nestjs/common';
import { BackupSettingController } from './backup-setting.controller';
import { BackupSettingService } from './backup-setting.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [BackupSettingController],
  providers: [BackupSettingService],
})
export class BackupSettingModule {}
