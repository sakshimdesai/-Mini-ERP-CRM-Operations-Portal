import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productName!: string;

  @Column({ unique: true })
  sku!: string;

  @Column()
  category!: string;

  @Column('decimal')
  unitPrice!: number;

  @Column({
    default: 0,
  })
  currentStock!: number;

  @Column()
  minimumStockAlert!: number;

  @Column()
  warehouse!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}