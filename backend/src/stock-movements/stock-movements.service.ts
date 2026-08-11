import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  StockMovement,
  MovementType,
} from './stock-movements.entity';

import { Product } from '../products/products.entity';

import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private stockRepository: Repository<StockMovement>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateStockMovementDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.movementType === MovementType.IN) {
      product.currentStock += dto.quantity;
    } else {
      if (product.currentStock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.productName}. Available: ${product.currentStock}, requested: ${dto.quantity}`,
        );
      }

      product.currentStock -= dto.quantity;
    }

    await this.productRepository.save(product);

    const movement = this.stockRepository.create(dto);

    return this.stockRepository.save(movement);
  }

  findAll() {
    return this.stockRepository.find({
      order: {
        timestamp: 'DESC',
      },
    });
  }
}