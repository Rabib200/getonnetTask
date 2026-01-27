import { Body, Controller, Get, Post } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { FilePathDto } from './dto/filepath.dto';

@Controller({ path: 'import' })
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('sync')
  async triggerSync(@Body() filePathDto: FilePathDto) {
    return this.importsService.triggerSync(filePathDto.filePath);
  }

  @Get('progress')
  async getProgress() {
    return this.importsService.getProgress();
  }
}
