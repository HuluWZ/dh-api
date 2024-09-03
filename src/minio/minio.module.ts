import { Module, OnModuleInit } from '@nestjs/common';
import { MinioController } from './minio.controller';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioClientService } from './minio.service';

@Module({
  providers: [MinioClientService],
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          endPoint: configService.get('MINIO_ENDPOINT') || 'localhost',
          port: parseInt(configService.get('MINIO_PORT'), 10) || 9000,
          useSSL: configService.get('MINIO_USE_SSL') === 'true',
          accessKey: configService.get('MINIO_ROOT_USER') || 'minio',
          secretKey: configService.get('MINIO_ROOT_PASSWORD') || 'minio123',
          publicBucket: configService.get('MINIO_PUBLIC_BUCKET') || 'public',
          privateBucket: configService.get('MINIO_PRIVATE_BUCKET') || 'private',
        };
      },
    }),
  ],
  controllers: [MinioController],
  exports: [MinioClientService], // Exporting MinioService so it can be used in other modules
})
export class FileUploadModule {}
