import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

import { MovementType } from '../stock-movements.entity';

export class CreateStockMovementDto {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsEnum(MovementType)
  movementType!: MovementType;

  @IsString()
  reason!: string;

  @IsString()
  createdBy!: string;
}