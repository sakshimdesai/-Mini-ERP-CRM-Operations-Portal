import { IsEnum } from 'class-validator';
import { ChallanStatus } from '../challans.entity';

export class UpdateChallanStatusDto {
  @IsEnum(ChallanStatus)
  status!: ChallanStatus;
}