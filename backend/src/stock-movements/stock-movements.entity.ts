import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  quantity!: number;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  movementType!: MovementType;

  @Column()
  reason!: string;

  @Column()
  createdBy!: string;

  @CreateDateColumn()
  timestamp!: Date;
}