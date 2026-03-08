import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AdminProductsService } from './admin.products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProductQueryDto, CreateProductDto, UpdateProductDto } from './dto';
import { UpdateStockDto } from './dto/update.dto';
import { IsExistedCategory } from 'src/common/guards/is-existed-category.guard';
import { IsExistedProduct } from 'src/common/guards/is-existed-product.guard';
import { CloudInterceptor } from 'src/common/interceptors/cloudinary.interceptor';

// ── Admin Routes (JWT protected) ──────────────────────────────────────────
@Controller('admin/products')
@UseGuards(JwtAuthGuard)
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  /** GET /api/admin/products — all products including inactive */
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.service.findAllAdmin(query);
  }

  /** GET /api/admin/products/stock-summary */
  @Get('stock-summary')
  getStockSummary() {
    return this.service.getStockSummary();
  }

  /** GET /api/admin/products/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  /** POST /api/admin/products  (multipart/form-data) */
  @Post()
  @UseInterceptors(
    FileInterceptor('image', { storage: memoryStorage() }),
    CloudInterceptor,
  )
  @UseGuards(IsExistedCategory)
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(dto);
  }

  /** PATCH /api/admin/products/:id */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @UseGuards(IsExistedCategory, IsExistedProduct)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  /** PATCH /api/admin/products/:id/stock */
  @Patch(':id/stock')
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.service.updateStock(id, dto);
  }

  /** DELETE /api/admin/products/:id */
  @Delete(':id')
  @UseGuards(IsExistedProduct)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
