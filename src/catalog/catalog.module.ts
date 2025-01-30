import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { MinioModule } from 'src/minio/minio.module';
import { MinioFileUploadService } from 'src/minio/minio.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OrgModule } from 'src/org/org.module';

@Module({
  imports: [MinioModule, AuthModule, JwtModule, OrgModule],
  providers: [MinioFileUploadService, CatalogService],
  controllers: [CatalogController],
})
export class CatalogModule {}
