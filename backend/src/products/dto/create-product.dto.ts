import {
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  productName!: string;

  @IsString()
  sku!: string;

  @IsString()
  category!: string;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @IsNumber()
  @Min(0)
  currentStock!: number;

  @IsNumber()
  @Min(0)
  minimumStockAlert!: number;

  @IsString()
  warehouse!: string;
}