import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';
import { StockMovement } from './stock-movements.entity';

import { Product } from '../products/products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockMovement,
      Product,
    ]),
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
})
export class StockMovementsModule {}