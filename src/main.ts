import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/prisma-exception/prisma-exception.filter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { UpdateLastSeenMiddleware } from './update-last-seen.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableCors();
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  // Use default IoAdapter for WebSocket
  app.useWebSocketAdapter(new IoAdapter(app.getHttpServer()));
  const config = new DocumentBuilder()
    .setTitle('DH API')
    .setDescription('The DH API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const port = process.env.PORT || 3000;
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
  console.log(`   Server is running on port ${port}   🚀`);
}
bootstrap();
