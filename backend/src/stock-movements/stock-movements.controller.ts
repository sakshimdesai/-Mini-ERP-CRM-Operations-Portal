import { Body, Controller, Get, Post } from '@nestjs/common';

import { StockMovementsService } from './stock-movements.service';

import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(
    private readonly stockService: StockMovementsService,
  ) {}

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.stockService.create(dto);
  }

  @Get()
  findAll() {
    return this.stockService.findAll();
  }
}