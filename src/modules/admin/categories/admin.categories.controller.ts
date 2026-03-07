import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './admin.categories.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { IsExistedCategory } from 'src/common/guards/is-existed-category.guard';

// ── Admin Routes (JWT protected) ──────────────────────────────────────────
@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
export class AdminCategoriesController {
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

  /** POST /api/admin/categories */
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  /** PATCH /api/admin/categories/:id */
  @Patch(':id')
  @UseGuards(IsExistedCategory)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/admin/categories/:id */
  @Delete(':id')
  @UseGuards(IsExistedCategory)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
