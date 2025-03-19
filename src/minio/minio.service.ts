import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cuid from 'cuid';
import { Client } from 'minio';
import { FileBucket } from 'src/cloudinary/file/file.constants';
import { minioConfigType } from 'src/config/minio.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MinioFileUploadService implements OnModuleInit {
  private minioClient: Client;
  private readonly logger = new Logger();
  private minioConfig: any;

  constructor(
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.minioConfig = this.config.get<minioConfigType>('minio');
    this.minioClient = new Client(this.minioConfig);
  }

  async onModuleInit() {
    await this.initializeBuckets();
  }

  private async initializeBuckets() {
    try {
      const buckets = ['public', 'private'];
      for (const bucket of buckets) {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket);
          this.logger.log(`Bucket ${bucket} created successfully.`);
        }
      }
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async uploadSingleFile(file: Express.Multer.File, bucketName: FileBucket) {
    try {
      const extension = file.originalname.split('.').pop();
      const fileName = `${cuid()}.${extension}`;
      const filePath = `${bucketName}/${fileName}`;
      const metaData = {
        'Content-Type': file.mimetype,
      };

      await this.minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
        metaData,
      );
      return {
        path: filePath,
        fileName: fileName,
      };
    } catch (error) {
      console.log({ error });
      throw new HttpException('Failed to upload file', 500);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    bucketName: FileBucket,
  ) {
    const responses = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await this.uploadSingleFile(file, bucketName);
        return uploadResult;
      }),
    );

    return responses;
  }

  async getFile(bucketName: string, objectName: string) {
    try {
      return this.minioClient.getObject(bucketName, objectName);
    } catch (error) {
      console.log({ error });
      throw new NotFoundException('File not found');
    }
  }

  async getPresignedFile(bucketName: string, objectName: string) {
    try {
      return this.minioClient.presignedUrl(
        'GET',
        bucketName,
        objectName,
        5 * 24 * 60 * 60,
      );
    } catch (error) {
      console.log({ error });
      throw new NotFoundException('Error Generating Presigned Url');
    }
  }

  async deleteFile(bucketName: string, objectName: string) {
    return this.minioClient.removeObject(bucketName, objectName);
  }
}
