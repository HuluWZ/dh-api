import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import minioConfig from './minio.config';
import firebaseConfig from './firebase.config';
import uploadConfig from './upload.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, minioConfig, firebaseConfig, uploadConfig],
      isGlobal: true,
    }),
  ],
})
export class ConfigAppModule {}
