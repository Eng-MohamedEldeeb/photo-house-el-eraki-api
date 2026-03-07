import { Module } from '@nestjs/common';
import { CategoriesService } from './admin.categories.service';
import { AdminCategoriesController } from './admin.categories.controller';
import { CategoryModel } from 'src/db/entities/category.entity';

@Module({
  imports: [CategoryModel],
  providers: [CategoriesService],
  controllers: [AdminCategoriesController],
  exports: [CategoriesService],
})
export class AdminCategoriesModule {}
