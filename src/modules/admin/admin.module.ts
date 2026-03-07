import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCategoriesModule } from './categories/admin.categories.module';
import { AdminProductsModule } from './products/admin.products.module';
import { AdminModel } from 'src/db/entities/admin.entity';

@Module({
  imports: [AdminModel, AdminProductsModule, AdminCategoriesModule],
  exports: [TypeOrmModule],
})
export class AdminModule {}
