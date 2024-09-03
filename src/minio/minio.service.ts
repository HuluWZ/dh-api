import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { FileBucket } from './file/file.constants';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';

@Injectable()
export class MinioService {
  private minioClient: Client;
  private readonly minioConfig: any;
  private readonly logger = new Logger(MinioService.name);

  constructor(private readonly configService: ConfigService) {
    this.minioConfig = this.configService.get('minio');

    this.minioClient = new Client({
      endPoint: this.minioConfig.endPoint,
      port: this.minioConfig.port,
      useSSL: this.minioConfig.useSSL,
      accessKey: this.minioConfig.accessKey,
      secretKey: this.minioConfig.secretKey,
    });
    // this.initializeBuckets();
  }

  private async initializeBuckets() {
    const buckets = ['public', 'private'];
    for (const bucket of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket, 'us-east-1'); // Adjust region if necessary
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

    return fileName;
  }

  async deleteFile(bucketName: FileBucket, objectName: string): Promise<void> {
    return this.minioClient.removeObject(bucketName, objectName);
  }

  getFileUrl(bucketName: FileBucket, fileName: string): string {
    const protocol = this.minioConfig.useSSL ? 'https' : 'http';
    return `${protocol}://${this.minioConfig.endPoint}:${this.minioConfig.port}/${bucketName}/${fileName}`;
  }
}
