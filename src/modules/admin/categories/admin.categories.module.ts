import { Module } from '@nestjs/common';
import { CategoriesService } from './admin.categories.service';
import { AdminCategoriesController } from './admin.categories.controller';
import { CategoryModel } from 'src/db/entities/category.entity';
import { CloudinaryModule } from 'src/common/utils/cloudinary/cloudinary.module';

@Module({
  imports: [CategoryModel, CloudinaryModule],
  providers: [CategoriesService],
  controllers: [AdminCategoriesController],
  exports: [CategoriesService],
})
export class AdminCategoriesModule {}
