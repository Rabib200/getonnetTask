import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Logger } from '@nestjs/common/services/logger.service';
import { PrismaService } from 'src/database/prisma.service';

@Processor('csv-import', {
  concurrency: 1,
  lockDuration: 600000,
})
export class ImportsProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { jobId, filePath } = job.data;

    try {
      await this.processCsv(filePath, jobId, job);

      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'COMPLETED', finishedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error.message,
          finishedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async processCsv(filePath: string, jobId: string, job: Job): Promise<void> {
    return new Promise((resolve, reject) => {
      let batch: any[] = [];
      const batchSize = parseInt(process.env.BATCH_SIZE || '10000');
      let totalProcessed = 0;
      let batchCount = 0;

      const stream = fs.createReadStream(filePath).pipe(csv());

      stream
        .on('data', (row) => {
          const customer = this.transformRow(row, jobId);
          batch.push(customer);

          if (batch.length >= batchSize) {
            stream.pause();
            const currentBatch = [...batch];
            batch = [];
            batchCount++;

            this.insertBatch(currentBatch, jobId)
              .then(async () => {
                totalProcessed += currentBatch.length;
                if (batchCount % 2 === 0) {
                  const progress = Math.floor((totalProcessed / 2000000) * 100);
                  await job.updateProgress(progress);
                }
                stream.resume();
              })
              .catch((error) => {
                Logger.error('Batch insert error:', error);
                stream.resume();
              });
          }
        })
        .on('end', async () => {
          if (batch.length > 0) {
            await this.insertBatch(batch, jobId);
          }
          await job.updateProgress(100);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private transformRow(row: any, jobId: string) {
    return {
      customerId: row['Customer Id']?.trim(),
      firstName: row['First Name']?.trim(),
      lastName: row['Last Name']?.trim(),
      phone1: row['Phone 1']?.trim() || '',
      phone2: row['Phone 2']?.trim() || '',
      company: row['Company']?.trim() || '',
      city: row['City']?.trim() || '',
      country: row['Country']?.trim() || '',
      email: row['Email']?.trim(),
      subscriptionDate: new Date(row['Subscription Date']),
      website: row['Website']?.trim() || '',
      description: row['About Customer']?.trim() || '',
      importJobId: jobId,
    };
  }

  private async insertBatch(customers: any[], jobId: string): Promise<void> {
    try {
      await this.prisma.customer.createMany({
        data: customers,
      });
    } catch (error: any) {
      Logger.error('Batch insert error:', error);
    }

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        processedRows: { increment: customers.length },
      },
    });
  }
}
