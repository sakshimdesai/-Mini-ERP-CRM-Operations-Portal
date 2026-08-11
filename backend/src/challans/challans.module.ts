import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChallansController } from './challans.controller';
import { ChallansService } from './challans.service';
import { Challan } from './challans.entity';

import { Customer } from '../customers/customer.entity';
import { Product } from '../products/products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challan,
      Customer,
      Product,
    ]),
  ],
  controllers: [ChallansController],
  providers: [ChallansService],
})
export class ChallansModule {}