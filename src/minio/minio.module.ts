import { Module } from '@nestjs/common';
import { MinioFileUploadController } from './minio.controller';
import { MinioFileUploadService } from './minio.service';

@Module({
  controllers: [MinioFileUploadController],
  providers: [MinioFileUploadService],
})
export class MinioModule {}
