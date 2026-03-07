import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../db/entities/category.entity';
import { CategoriesService } from './categories.service';
import {
  CategoriesController,
  AdminCategoriesController,
} from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService],
  controllers: [CategoriesController, AdminCategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
