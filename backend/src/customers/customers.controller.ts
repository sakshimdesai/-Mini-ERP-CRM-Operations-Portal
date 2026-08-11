import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.customersService.search(q);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.customersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.customersService.remove(+id);
  }
}