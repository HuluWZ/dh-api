import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';

@Module({
  providers: [MinioService],
  controllers: [MinioController],
  exports: [MinioService], // Exporting MinioService so it can be used in other modules
})
export class MinioModule {}
