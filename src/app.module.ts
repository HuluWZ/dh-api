import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { ConfigAppModule } from './config/config.module';
import { MinioModule } from './minio/minio.module';
import { OrgModule } from './org/org.module';

@Module({
  imports: [
    ConfigAppModule,
    AuthModule,
    PrismaModule,
    CommonModule,
    MinioModule,
    OrgModule,
  ],
})
export class AppModule {}
