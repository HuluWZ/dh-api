import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Get,
  Param,
  Delete,
  Res,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import { Response } from 'express';
import { MimeType } from 'mime-type';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileBucket } from './file/file.constants';

const mime = MimeType();
@ApiTags('File Upload')
@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload Single File' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        bucketName: {
          type: 'string',
          enum: ['public', 'private'],
          description: 'Choose between public and private bucket',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('bucketName') bucketName: string,
  ) {
    console.log({ bucketName });
    if (bucketName !== 'public' && bucketName !== 'private') {
      throw new BadRequestException(
        'Invalid bucket name. Must be either "public" or "private".',
      );
    }
    console.log({ file });
    const url = await this.minioService.uploadFile(file, bucketName);

    return { url, message: 'File uploaded successfully' };
  }

  // Upload multiple files
  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload Multiple Files' })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() bucketName: FileBucket,
  ) {
    const uploadResults = [];

    for (const file of files) {
      const url = await this.minioService.uploadFile(file, bucketName);
      uploadResults.push(url);
    }

    return { message: 'Files uploaded successfully', urls: uploadResults };
  }

  // Get a file by filename and bucket name
  @ApiOperation({ summary: 'Get File By Name' })
  @Get('file/:bucketName/:fileName')
  async getFile(
    @Param('bucketName') bucketName: FileBucket,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const file = this.minioService.getFileUrl(bucketName, fileName);
    const mimeType = mime.lookup(fileName);

    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.send(file);
  }

  // Delete a file by filename and bucket name
  @Delete('file/:bucketName/:fileName')
  @ApiOperation({ summary: 'Delete File By Name' })
  async deleteFile(
    @Param('bucketName') bucketName: FileBucket,
    @Param('fileName') fileName: string,
  ) {
    await this.minioService.deleteFile(bucketName, fileName);
    return { message: 'File deleted successfully' };
  }
}
