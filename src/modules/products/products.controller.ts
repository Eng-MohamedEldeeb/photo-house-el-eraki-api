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
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  ProductQueryDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// ── Public Routes ─────────────────────────────────────────────────────────
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  /** GET /api/products?search=&categoryId=&page=&limit= */
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.service.findAll(query);
  }

  /** GET /api/products/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}

// ── Admin Routes (JWT protected) ──────────────────────────────────────────
@Controller('admin/products')
@UseGuards(JwtAuthGuard)
export class AdminProductsController {
  constructor(private readonly service: ProductsService) {}

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
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(dto, file);
  }

  /** PATCH /api/admin/products/:id */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
