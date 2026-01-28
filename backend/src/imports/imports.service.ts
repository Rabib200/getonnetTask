import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { stat } from 'fs';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ImportsService {
  constructor(
    @InjectQueue('csv-import')
    private readonly csvImportQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async triggerSync(filePath?: string) {
    const csvFilePath =
      filePath || process.env.CSV_FILE_PATH || 'data/customers-2000000.csv';

    const isImportRunning = await this.prisma.importJob.findFirst({
      where: { status: 'IN_PROGRESS' },
    });

    if (isImportRunning) {
      throw new BadRequestException('An import job is already in progress.');
    }

    const importJob = await this.prisma.importJob.create({
      data: {
        filePath: csvFilePath,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        totalRows: 2000000,
        processedRows: 0,
      },
    });

    await this.csvImportQueue.add('process-csv', {
      jobId: importJob.id,
      filePath: csvFilePath,
    });

    return {
      jobId: importJob.id,
      status: importJob.status,
      message: 'Import started Successfully',
    };
  }

  async getProgress() {
    const importJob = await this.prisma.importJob.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!importJob) {
      throw new BadRequestException('No import job found.');
    }

    const percentage =
      importJob.totalRows > 0
        ? (importJob.processedRows / importJob.totalRows) * 100
        : 0;

    const elapsed = Math.max(
      1,
      Math.floor(
        (Date.now() - (importJob.startedAt?.getTime() || Date.now())) / 1000,
      ),
    );
    const rate = Math.round(importJob.processedRows / elapsed);

    const remaining = importJob.totalRows - importJob.processedRows;
    const etaSec = rate > 0 ? Math.ceil(remaining / rate) : 0;

    return {
      jobId: importJob.id,
      status: importJob.status,
      processedRows: importJob.processedRows,
      totalRows: importJob.totalRows,
      percentage: Math.round(percentage * 100) / 100,
      rate: `${rate.toLocaleString()} rows/sec`,
      elapsedTime: `${elapsed}s`,
      eta: `${etaSec}s`,
      startedAt: importJob.startedAt,
      finishedAt: importJob.finishedAt,
      error: importJob.error,
    };
  }
}
