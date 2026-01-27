import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CustomerModule } from './customer/customer.module';
import { ImportsModule } from './imports/imports.module';

@Module({
  imports: [DatabaseModule, CustomerModule, ImportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
