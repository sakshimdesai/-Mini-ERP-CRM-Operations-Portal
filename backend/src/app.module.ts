import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { ChallansModule } from './challans/challans.module';

@Module({
  imports: [AuthModule, UsersModule, CustomersModule, ProductsModule, InventoryModule, StockMovementsModule, ChallansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
