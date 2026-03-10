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
  UseInterceptors,
  SetMetadata,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './admin.categories.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { IsExistedCategory } from 'src/common/guards/is-existed-category.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudInterceptor } from 'src/common/interceptors/cloudinary.interceptor';

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
  @SetMetadata('directory', 'photo-house/categories') // For CloudInterceptor to know where to upload
  @UseInterceptors(
    FileInterceptor('image', { storage: memoryStorage() }),
    CloudInterceptor,
  )
  create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(dto);
  }

  /** PATCH /api/admin/categories/:id */
  @Patch(':id')
  @UseGuards(IsExistedCategory)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  /** DELETE /api/admin/categories/:id */
  @Delete(':id')
  @UseGuards(IsExistedCategory)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
