import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

import {
  CustomerStatus,
  CustomerType,
} from '../customer.entity';

export class CreateCustomerDto {
  @IsString()
  customerName!: string;

  @IsMobilePhone('en-IN')
  mobileNumber!: string;

  @IsEmail()
  email!: string;

  @IsString()
  businessName!: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsEnum(CustomerType)
  customerType!: CustomerType;

  @IsString()
  address!: string;

  @IsEnum(CustomerStatus)
  status!: CustomerStatus;

  @IsOptional()
  @IsDateString()
  followUpDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}