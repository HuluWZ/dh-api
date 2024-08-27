import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('DH')
    .addBearerAuth()
    .setDescription('The DH API description')
    .setVersion('0.1')
    .build();
  const port = process.env.PORT || 3000;
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  console.log(`   Server is running on port ${port}   🚀`);
  await app.listen(port);
}
bootstrap();
