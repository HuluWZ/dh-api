import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    switch (exception.code) {
      case 'P2002':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Duplicate entry for the field: ${exception.meta?.target} on  ${exception.meta?.modelName}s`;
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = `Record of ${exception.meta?.modelName} not found`;
        break;
      default:
        message = exception.message;
        break;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
    });
  }
}
