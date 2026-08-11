import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  Repository,
} from 'typeorm';

import {
  Challan,
  ChallanStatus,
} from './challans.entity';

import { Customer } from '../customers/customer.entity';
import { Product } from '../products/products.entity';

import {
  StockMovement,
  MovementType,
} from '../stock-movements/stock-movements.entity';

import {
  CreateChallanDto,
} from './dto/create-challan.dto';

import {
  UpdateChallanStatusDto,
} from './dto/update-challan-status.dto';

@Injectable()
export class ChallansService {
  constructor(
    @InjectRepository(Challan)
    private readonly challanRepository: Repository<Challan>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createChallanDto: CreateChallanDto) {
    const customer =
      await this.customerRepository.findOne({
        where: {
          id: createChallanDto.customerId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer not found',
      );
    }

    /*
     * Combine duplicate product IDs if the same
     * product accidentally appears more than once.
     */
    const quantities = new Map<number, number>();

    for (const item of createChallanDto.products) {
      const existing =
        quantities.get(item.productId) ?? 0;

      quantities.set(
        item.productId,
        existing + item.quantity,
      );
    }

    const productSnapshots: Array<{
      productId: number;
      productName: string;
      sku: string;
      category: string;
      unitPrice: number;
      quantity: number;
      warehouse: string;
    }> = [];

    let totalQuantity = 0;

    for (const [productId, quantity] of quantities) {
      const product =
        await this.productRepository.findOne({
          where: {
            id: productId,
          },
        });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${productId} not found`,
        );
      }

      productSnapshots.push({
        productId: product.id,
        productName: product.productName,
        sku: product.sku,
        category: product.category,
        unitPrice: Number(product.unitPrice),
        quantity,
        warehouse: product.warehouse,
      });

      totalQuantity += quantity;
    }

    const challan =
      this.challanRepository.create({
        challanNumber:
          this.generateChallanNumber(),

        customerId: customer.id,

        customerSnapshot: {
          customerName: customer.customerName,
          mobileNumber: customer.mobileNumber,
          email: customer.email,
          businessName: customer.businessName,
          gstNumber: customer.gstNumber,
          address: customer.address,
        },

        products: productSnapshots,

        totalQuantity,

        status: ChallanStatus.DRAFT,

        createdBy: createChallanDto.createdBy,
      });

    return this.challanRepository.save(challan);
  }

  async findAll() {
    return this.challanRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const challan =
      await this.challanRepository.findOne({
        where: {
          id,
        },
      });

    if (!challan) {
      throw new NotFoundException(
        'Challan not found',
      );
    }

    return challan;
  }

  async updateStatus(
    id: number,
    dto: UpdateChallanStatusDto,
  ) {
    const challan =
      await this.findOne(id);

    if (
      challan.status ===
      ChallanStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cancelled challan cannot be modified',
      );
    }

    if (
      challan.status ===
      ChallanStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Confirmed challan cannot be modified',
      );
    }

    if (
      dto.status ===
      ChallanStatus.DRAFT
    ) {
      return challan;
    }

    if (
      dto.status ===
      ChallanStatus.CANCELLED
    ) {
      challan.status =
        ChallanStatus.CANCELLED;

      return this.challanRepository.save(
        challan,
      );
    }

    if (
      dto.status ===
      ChallanStatus.CONFIRMED
    ) {
      return this.confirmChallan(
        challan.id,
      );
    }

    throw new BadRequestException(
      'Invalid challan status',
    );
  }

  private async confirmChallan(
    challanId: number,
  ) {
    return this.dataSource.transaction(
      async (manager) => {
        const challanRepository =
          manager.getRepository(Challan);

        const productRepository =
          manager.getRepository(Product);

        const stockMovementRepository =
          manager.getRepository(
            StockMovement,
          );

        const challan =
          await challanRepository.findOne({
            where: {
              id: challanId,
            },
          });

        if (!challan) {
          throw new NotFoundException(
            'Challan not found',
          );
        }

        if (
          challan.status !==
          ChallanStatus.DRAFT
        ) {
          throw new BadRequestException(
            'Only Draft challans can be confirmed',
          );
        }

        /*
         * First verify ALL products have
         * sufficient stock.
         */
        const productsToUpdate: Product[] =
          [];

        for (const item of challan.products) {
          const product =
            await productRepository.findOne({
              where: {
                id: item.productId,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            });

          if (!product) {
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          }

          if (
            product.currentStock <
            item.quantity
          ) {
            throw new BadRequestException(
              `Insufficient stock for ${product.productName}. Available: ${product.currentStock}, requested: ${item.quantity}`,
            );
          }

          productsToUpdate.push(product);
        }

        /*
         * All stock checks passed.
         *
         * Reduce stock and create an OUT
         * stock movement for every product.
         */
        for (
          let i = 0;
          i < productsToUpdate.length;
          i++
        ) {
          const product =
            productsToUpdate[i];

          const item =
            challan.products[i];

          product.currentStock -=
            item.quantity;

          await productRepository.save(
            product,
          );

          const movement =
            stockMovementRepository.create({
              productId: product.id,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan ${challan.challanNumber}`,
              createdBy: challan.createdBy,
            });

          await stockMovementRepository.save(
            movement,
          );
        }

        /*
         * All stock updates and movement
         * records succeeded.
         */
        challan.status =
          ChallanStatus.CONFIRMED;

        return challanRepository.save(
          challan,
        );
      },
    );
  }

  private generateChallanNumber(): string {
    const date = new Date();

    const datePart =
      `${date.getFullYear()}${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}${String(
        date.getDate(),
      ).padStart(2, '0')}`;

    const timePart =
      Date.now()
        .toString()
        .slice(-8);

    return `CH-${datePart}-${timePart}`;
  }
}