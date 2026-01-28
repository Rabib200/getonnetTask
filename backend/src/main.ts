import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue } from 'bullmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const csvImportQueue = new Queue('csv-import', {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  createBullBoard({
    queues: [new BullMQAdapter(csvImportQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

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
  Logger.debug(
    `Bull Board dashboard: http://localhost:${process.env.PORT ?? 5005}/admin/queues`,
  );
}
bootstrap();
