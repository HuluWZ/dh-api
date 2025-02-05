import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResetContentResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as mime from 'mime-types';
import { MinioFileUploadService } from './minio.service';

@ApiTags('Minio AWS File Upload')
@Controller('minio-file-upload')
export class MinioFileUploadController {
  constructor(private readonly fileUploadService: MinioFileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Minio Upload Single File' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.uploadSingleFile(file, 'public');
  }

  @Get('file/:folder/:filename')
  @ApiOperation({ summary: 'Get Minio File by Folder and Filename' })
  async getFile(
    @Res() res: Response,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Query('disposition') disposition: string,
  ) {
    try {
      const file = await this.fileUploadService.getFile(folder, filename);
      const ContentType = mime.lookup(`${folder}/${filename}`);
      const contentDisposition =
        disposition && disposition.toLocaleLowerCase() === 'inline'
          ? 'inline'
          : 'attachment';
      console.log('Pipeline Trigger');
      res.set({
        'Accept-Ranges': 'bytes',
        'Content-Type': ContentType ?? 'application/octet-stream',
        'Content-Disposition': `${contentDisposition}; filename="${filename}"`,
      });

      file.pipe(res);
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  }

  @Get('url/:folder/:filename')
  @ApiOperation({ summary: 'Get Temporary URL by Folder and Filename' })
  async getFileUrl(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    try {
      const url = await this.fileUploadService.getPresignedFile(
        folder,
        filename,
      );
      return { url };
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  }

  @Delete(':folder/:filename')
  @ApiOperation({ summary: 'Delete Minio File by Folder and Filename' })
  deleteFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    return this.fileUploadService.deleteFile(folder, filename);
  }
}
