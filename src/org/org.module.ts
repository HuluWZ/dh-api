import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { AuthModule } from 'src/auth/auth.module';
import { MinioModule } from 'src/minio/minio.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, JwtModule, MinioModule],
  controllers: [OrgController],
  providers: [OrgService],
})
export class OrgModule {}
