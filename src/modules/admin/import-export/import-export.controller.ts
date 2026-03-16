import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { SheetsSyncDto } from './dto/sheets-sync.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  // ── EXPORT ────────────────────────────────────────────────────────────────

  @Get('export/products')
  async exportProducts(@Res() res: Response) {
    const buffer = await this.importExportService.exportProducts();
    const filename = `products-${Date.now()}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength,
    });
    res.end(buffer);
  }

  @Get('export/categories')
  async exportCategories(@Res() res: Response) {
    const buffer = await this.importExportService.exportCategories();
    const filename = `categories-${Date.now()}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength,
    });
    res.end(buffer);
  }

  // ── IMPORT ────────────────────────────────────────────────────────────────

  @Post('import/products')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(new Error('Only .xlsx and .xls files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    return;
  }

  @Post('import/categories')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(new Error('Only .xlsx and .xls files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importCategories(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    return this.importExportService.importCategories(file.buffer);
  }

  // ── GOOGLE SHEETS: PUSH (DB → Sheet) ──────────────────────────────────────

  @Post('sheets/push/products')
  @HttpCode(HttpStatus.OK)
  async pushProductsToSheet(@Body() dto: SheetsSyncDto) {
    return this.importExportService.pushProductsToSheet(
      dto.spreadsheetId,
      dto.sheetName ?? 'Products',
    );
  }

  @Post('sheets/push/categories')
  @HttpCode(HttpStatus.OK)
  async pushCategoriesToSheet(@Body() dto: SheetsSyncDto) {
    return this.importExportService.pushCategoriesToSheet(
      dto.spreadsheetId,
      dto.sheetName ?? 'Categories',
    );
  }

  // ── GOOGLE SHEETS: PULL (Sheet → DB) ──────────────────────────────────────

  @Post('sheets/pull/products')
  @HttpCode(HttpStatus.OK)
  async pullProductsFromSheet(@Body() dto: SheetsSyncDto) {
    return this.importExportService.pullProductsFromSheet(
      dto.spreadsheetId,
      dto.sheetName ?? 'Products',
    );
  }

  @Post('sheets/pull/categories')
  @HttpCode(HttpStatus.OK)
  async pullCategoriesFromSheet(@Body() dto: SheetsSyncDto) {
    return this.importExportService.pullCategoriesFromSheet(
      dto.spreadsheetId,
      dto.sheetName ?? 'Categories',
    );
  }
}
