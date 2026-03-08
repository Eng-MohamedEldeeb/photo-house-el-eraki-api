import { Module } from '@nestjs/common';
import { ProductModel } from '../../../db/entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CloudinaryModule } from '../../../common/utils/cloudinary/cloudinary.module';

@Module({
  imports: [ProductModel, CloudinaryModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
