import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';

// ── Public Routes ─────────────────────────────────────────────────────────
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  /** GET /api/categories */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** GET /api/categories/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
