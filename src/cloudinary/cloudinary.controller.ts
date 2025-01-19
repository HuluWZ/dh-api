import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('Cloud File Upload')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly uploadService: CloudinaryService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Cloudinary Upload Single File' })
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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file);
    return { url, message: 'File uploaded successfully' };
  }

  // Upload multiple files
  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload Multiple Files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          maximum: 5,
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadResults = [];

    for (const file of files) {
      const url = await this.uploadService.uploadFile(file);
      uploadResults.push(url);
    }

    return { message: 'Files uploaded successfully', urls: uploadResults };
  }
}
