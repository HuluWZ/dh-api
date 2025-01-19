import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import firebaseConfig from './firebase.config';
import uploadConfig from './upload.config';
import redisConfig from './redis.config';
import minioConfig from './minio.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        databaseConfig,
        redisConfig,
        firebaseConfig,
        uploadConfig,
        minioConfig,
      ],
      isGlobal: true,
    }),
  ],
})
export class ConfigAppModule {}
