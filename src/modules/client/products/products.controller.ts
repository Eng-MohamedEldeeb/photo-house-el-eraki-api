import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/query.dto';

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

   /** GET /api/products/:id */
  @Get('featured')
  findFeatured() {
    return this.service.findFeatured();
  }
}
