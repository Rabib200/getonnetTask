import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { debug } from 'console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Large CSV Import API')
    .setDescription('API for importing large CSV files and managing customers')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5005);
  Logger.debug(
    `Application is running on: http://localhost:${process.env.PORT ?? 5005}`,
  );
  Logger.debug(
    `Swagger documentation: http://localhost:${process.env.PORT ?? 5005}/api`,
  );
}
bootstrap();
