
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CustomerType {
  RETAIL = 'Retail',
  WHOLESALE = 'Wholesale',
  DISTRIBUTOR = 'Distributor',
}

export enum CustomerStatus {
  LEAD = 'Lead',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerName!: string;

  @Column()
  mobileNumber!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  businessName!: string;

  @Column({ nullable: true })
  gstNumber?: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
  })
  customerType!: CustomerType;

  @Column()
  address!: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.LEAD,
  })
  status!: CustomerStatus;

  @Column({
    type: 'date',
    nullable: true,
  })
  followUpDate?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}