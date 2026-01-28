import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const customers = await this.prisma.customer.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return customers;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    return await this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async update(id: string, updateCustomerDto: CreateCustomerDto) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
    return customer;
  }

  async findOne(id: string) {
    return await this.prisma.customer.findUnique({
      where: { id },
    });
  }

  async findRecent(limit: number) {
    return await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async sync() {}

  async progress() {}
}
