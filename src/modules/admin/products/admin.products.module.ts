import { Module } from '@nestjs/common';
import { AdminProductsService } from './admin.products.service';
import { AdminProductsController } from './admin.products.controller';
import { CloudinaryModule } from 'src/common/utils/cloudinary/cloudinary.module';
import { ProductModel } from 'src/db/entities/product.entity';
import { CategoryModel } from 'src/db/entities/category.entity';

@Module({
  imports: [ProductModel, CloudinaryModule, CategoryModel],
  providers: [AdminProductsService],
  controllers: [AdminProductsController],
  exports: [AdminProductsService],
})
export class AdminProductsModule {}
