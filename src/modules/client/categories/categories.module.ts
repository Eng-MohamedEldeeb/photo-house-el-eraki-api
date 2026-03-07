import { Module } from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryModel } from 'src/db/entities/category.entity';

@Module({
  imports: [CategoryModel],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
