import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.customerService.findAll(page, limit);
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: CreateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Get('recent')
  async findRecent(@Query('limit') limit: number = 20) {
    return this.customerService.findRecent(limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }
}
