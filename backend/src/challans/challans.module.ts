import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChallansController } from './challans.controller';
import { ChallansService } from './challans.service';
import { Challan } from './challans.entity';

import { Customer } from '../customers/customer.entity';
import { Product } from '../products/products.entity';
import { StockMovement } from '../stock-movements/stock-movements.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challan,
      Customer,
      Product,
      StockMovement,
    ]),
  ],
  controllers: [ChallansController],
  providers: [ChallansService],
})
export class ChallansModule {}