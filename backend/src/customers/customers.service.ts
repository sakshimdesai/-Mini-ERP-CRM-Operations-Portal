import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  findAll() {
    return this.customerRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    Object.assign(customer, updateCustomerDto);

    return this.customerRepository.save(customer);
  }

  async remove(id: number) {
    const customer = await this.findOne(id);

    await this.customerRepository.remove(customer);

    return {
      message: 'Customer deleted successfully',
    };
  }

  search(search: string) {
    return this.customerRepository.find({
      where: [
        {
          customerName: ILike(`%${search}%`),
        },
        {
          businessName: ILike(`%${search}%`),
        },
        {
          mobileNumber: ILike(`%${search}%`),
        },
      ],
    });
  }
}