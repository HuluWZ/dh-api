import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import minioConfig from './minio.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, minioConfig],
      isGlobal: true,
    }),
  ],
})
export class ConfigAppModule {}
