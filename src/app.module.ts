import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { MinioService } from './minio/minio.service';
import { MinioModule } from './minio/minio.module';
import { ConfigAppModule } from './config/config.module';

@Module({
  imports: [
    ConfigAppModule,
    AuthModule,
    PrismaModule,
    CommonModule,
    MinioModule,
  ],
  providers: [MinioService],
})
export class AppModule {}
