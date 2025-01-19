import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinioFileUploadService } from './minio.service';

@ApiTags('Minio File Upload')
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

  @Get(':folder/:filename')
  @ApiOperation({ summary: 'Get Minio File by Folder and Filename' })
  async getFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const fileStream = await this.fileUploadService.getFile(folder, filename);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    fileStream.pipe(res);
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
