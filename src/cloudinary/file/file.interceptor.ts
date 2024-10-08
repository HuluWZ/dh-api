import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import {
  DOC_ALLOWED_TYPES,
  MAX_DOC_SIZE,
  IMAGE_ALLOWED_TYPES,
  MAX_IMAGE_SIZE,
} from './file.constants';

@Injectable()
export class FileInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      return next.handle();
    }
    const isImage = IMAGE_ALLOWED_TYPES.includes(file.mimetype);
    const isDocument = DOC_ALLOWED_TYPES.includes(file.mimetype);

    if (isImage) {
      this.validateFile(file, IMAGE_ALLOWED_TYPES, MAX_IMAGE_SIZE, 'image');
    } else if (isDocument) {
      this.validateFile(file, DOC_ALLOWED_TYPES, MAX_DOC_SIZE, 'document');
    } else {
      throw new BadRequestException(
        `Invalid file type. Allowed types for images: ${IMAGE_ALLOWED_TYPES.join(
          ', ',
        )}, and documents: ${DOC_ALLOWED_TYPES.join(', ')}`,
      );
    }

    return next.handle();
  }

  private validateFile(
    file: Express.Multer.File,
    allowedTypes: string[],
    maxSize: number,
    fileType: string,
  ) {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid ${fileType} type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size allowed for ${fileType} is ${
          maxSize / 1024 / 1024
        }MB`,
      );
    }
  }
}
