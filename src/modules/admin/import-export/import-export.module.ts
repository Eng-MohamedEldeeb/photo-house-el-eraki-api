import { Module } from '@nestjs/common';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
import { GoogleSheetsService } from 'src/common/utils/google-sheet/google-sheets.service';
import { ProductModel } from 'src/db/entities/product.entity';
import { CategoryModel } from 'src/db/entities/category.entity';

@Module({
  imports: [ProductModel, CategoryModel],
  controllers: [ImportExportController],
  providers: [ImportExportService, GoogleSheetsService],
})
export class ImportExportModule {}
