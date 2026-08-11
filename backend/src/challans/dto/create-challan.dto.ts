import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChallanItemDto {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class CreateChallanDto {
  @IsInt()
  @IsPositive()
  customerId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChallanItemDto)
  products!: ChallanItemDto[];

  @IsString()
  createdBy!: string;
}