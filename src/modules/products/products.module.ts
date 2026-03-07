import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../db/entities/product.entity';
import { ProductsService } from './products.service';
import {
  ProductsController,
  AdminProductsController,
} from './products.controller';
import { CloudinaryModule } from '../../common/services/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CloudinaryModule],
  providers: [ProductsService],
  controllers: [ProductsController, AdminProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
