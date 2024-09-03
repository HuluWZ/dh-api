import { Injectable, Logger } from '@nestjs/common';
import { FileBucket } from './file/file.constants';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  private readonly minioConfig: any;
  private readonly logger = new Logger(MinioService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {
    this.minioConfig = this.configService.get('minio');

    // this.minioClient = new Client({
    //   endPoint: this.minioConfig.endPoint,
    //   port: this.minioConfig.port,
    //   useSSL: this.minioConfig.useSSL,
    //   accessKey: this.minioConfig.accessKey,
    //   secretKey: this.minioConfig.secretKey,
    // });
    // this.initializeBuckets();
    // this.initializeBuckets();
  }

  private async initializeBuckets() {
    const buckets = ['public', 'private'];
    for (const bucket of buckets) {
      try {
        const exists = await this.minioService.client.bucketExists(bucket);
        if (!exists) {
          await this.minioService.client.makeBucket(bucket, 'us-east-1'); // Adjust region if necessary
          this.logger.log(`Bucket ${bucket} created successfully.`);
        }
      } catch (err) {
        this.logger.error(`Failed to create bucket ${bucket}`, err.stack);
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketName: FileBucket,
  ): Promise<string> {
    const extension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;
    // const metaData = {
    //   'Content-Type': file.mimetype,
    // };

    await this.minioService.client.putObject(bucketName, fileName, file.buffer);

    return fileName;
  }

  async deleteFile(bucketName: FileBucket, objectName: string): Promise<void> {
    return this.minioService.client.removeObject(bucketName, objectName);
  }

  getFileUrl(bucketName: FileBucket, fileName: string): string {
    const protocol = this.minioConfig.useSSL ? 'https' : 'http';
    return `${protocol}://${this.minioConfig.endPoint}:${this.minioConfig.port}/${bucketName}/${fileName}`;
  }
}
