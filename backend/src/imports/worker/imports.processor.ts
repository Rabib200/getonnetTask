import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Logger } from '@nestjs/common/services/logger.service';
import { PrismaService } from 'src/database/prisma.service';

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
      const batchSize = parseInt(process.env.BATCH_SIZE || '1000');

      const stream = fs.createReadStream(filePath).pipe(csv());

      stream
        .on('data', async (row) => {
          stream.pause();

          const customer = this.transformRow(row, jobId);
          batch.push(customer);

          if (batch.length >= batchSize) {
            const currentBatch = [...batch];
            batch = [];

            try {
              await this.insertBatch(currentBatch, jobId);
            } catch (error) {
              Logger.error('Batch insert error:', error);
            }
          }
          stream.resume();
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
    // Get existing customerIds to check for duplicates
    const customerIds = customers.map((c) => c.customerId);
    const existing = await this.prisma.customer.findMany({
      where: { customerId: { in: customerIds } },
      select: { customerId: true },
    });

    const existingIds = new Set(existing.map((c) => c.customerId));

    // Filter out duplicates
    const newCustomers = customers.filter(
      (c) => !existingIds.has(c.customerId),
    );

    // Insert only new customers in one batch
    if (newCustomers.length > 0) {
      await this.prisma.customer.createMany({
        data: newCustomers,
      });
    }

    // Update progress with total processed (including skipped duplicates)
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        processedRows: { increment: customers.length },
      },
    });
  }
}
