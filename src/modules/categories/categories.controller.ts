import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}

// ── Admin Routes (JWT protected) ──────────────────────────────────────────
@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly service: CategoriesService) {}

  /** POST /api/admin/categories */
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  /** PATCH /api/admin/categories/:id */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/admin/categories/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
