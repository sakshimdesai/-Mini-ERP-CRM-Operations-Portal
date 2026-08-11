import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ChallanStatus {
  DRAFT = 'Draft',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
}

@Entity('challans')
export class Challan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  challanNumber!: string;

  @Column()
  customerId!: number;

  @Column({ type: 'jsonb' })
  customerSnapshot!: {
    customerName: string;
    mobileNumber: string;
    email: string;
    businessName: string;
    gstNumber?: string;
    address: string;
  };

  @Column({ type: 'jsonb' })
  products!: Array<{
    productId: number;
    productName: string;
    sku: string;
    category: string;
    unitPrice: number;
    quantity: number;
    warehouse: string;
  }>;

  @Column()
  totalQuantity!: number;

  @Column({
    type: 'enum',
    enum: ChallanStatus,
    default: ChallanStatus.DRAFT,
  })
  status!: ChallanStatus;

  @Column()
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;
}