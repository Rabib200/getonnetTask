import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from 'src/database/prisma.service';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Logger } from '@nestjs/common/services/logger.service';

@Processor('csv-import')
export class ImportsProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { jobId, filePath } = job.data;

    try {
      await this.processCsv(filePath, jobId);

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

  async processCsv(filePath: string, jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let batch: any[] = [];
      const batchSize = parseInt(process.env.BATCH_SIZE || '100') || 100;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const customerData = this.transformRow(row, jobId);
          batch.push(customerData);

          if (batch.length >= batchSize) {
            const currentBatch = [...batch];
            batch = [];

            this.insertBatch(currentBatch, jobId).catch((err) => {
              Logger.debug(err);
            });
          }
        })
        .on('end', async () => {
          if (batch.length > 0) {
            await this.insertBatch(batch, jobId);
          }
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
    let successCount = 0;

    for (const customer of customers) {
      try {
        await this.prisma.customer.create({
          data: customer,
        });
        successCount++;
      } catch (error) {
        if (error.code === 'P2002') {
          continue;
        }
        throw error;
      }
    }
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        processedRows: { increment: successCount },
      },
    });
  }
}
