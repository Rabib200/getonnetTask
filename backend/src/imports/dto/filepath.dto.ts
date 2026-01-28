import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FilePathDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  filePath?: string;
}
