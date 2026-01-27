import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { BullModule } from '@nestjs/bullmq';
import { ImportsProcessor } from './worker/imports.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'csv-import',
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
  ],
  controllers: [ImportsController],
  providers: [ImportsService, ImportsProcessor],
})
export class ImportsModule {}
