import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Product, StockStatus } from 'src/db/entities/product.entity';
import { Category } from 'src/db/entities/category.entity';
import { GoogleSheetsService } from 'src/common/utils/google-sheet/google-sheets.service';
import { ImportResultDto } from './dto/import-result.dto';

// ── Column definitions ────────────────────────────────────────────────────────

const PRODUCT_COLUMNS = [
  { header: 'ID', key: 'id', width: 8 },
  { header: 'Name EN', key: 'nameEn', width: 28 },
  { header: 'Name AR', key: 'nameAr', width: 28 },
  { header: 'Description EN', key: 'descriptionEn', width: 40 },
  { header: 'Description AR', key: 'descriptionAr', width: 40 },
  { header: 'Price', key: 'price', width: 12 },
  { header: 'SKU', key: 'sku', width: 16 },
  { header: 'Stock Qty', key: 'stockQuantity', width: 12 },
  { header: 'Sold Qty', key: 'soldQuantity', width: 12 },
  { header: 'Low Stock Threshold', key: 'lowStockThreshold', width: 20 },
  { header: 'Stock Status', key: 'stockStatus', width: 14 },
  { header: 'Is Featured', key: 'isFeatured', width: 12 },
  { header: 'Is Active', key: 'isActive', width: 12 },
  { header: 'Category ID', key: 'categoryId', width: 12 },
  { header: 'Category Name', key: 'categoryName', width: 20 },
  { header: 'Image URL', key: 'imageUrl', width: 40 },
  { header: 'Created At', key: 'createdAt', width: 20 },
];

const CATEGORY_COLUMNS = [
  { header: 'ID', key: 'id', width: 8 },
  { header: 'Name EN', key: 'nameEn', width: 28 },
  { header: 'Name AR', key: 'nameAr', width: 28 },
  { header: 'Description', key: 'description', width: 50 },
  { header: 'Products #', key: 'productCount', width: 12 },
  { header: 'Created At', key: 'createdAt', width: 20 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function styleHeader(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A1A' },
    };
    cell.font = { bold: true, color: { argb: 'FFC9A84C' }, size: 11 };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFC9A84C' } },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 22;
}

function bool(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string')
    return val.trim().toLowerCase() === 'true' || val.trim() === '1';
  return Boolean(val);
}

function num(val: unknown, fallback = 0): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly sheetsService: GoogleSheetsService,
  ) {}

  // ── EXPORT ────────────────────────────────────────────────────────────────

  async exportProducts(): Promise<ExcelJS.Buffer> {
    const products = await this.productRepo.find({
      relations: ['category'],
      order: { id: 'ASC' },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Photo House El Eraki';
    wb.created = new Date();

    const sheet = wb.addWorksheet('Products', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = PRODUCT_COLUMNS;
    styleHeader(sheet);

    for (const p of products) {
      sheet.addRow({
        id: p.id,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        descriptionEn: p.descriptionEn ?? '',
        descriptionAr: p.descriptionAr ?? '',
        price: Number(p.price),
        sku: p.sku ?? '',
        stockQuantity: p.stockQuantity,
        soldQuantity: p.soldQuantity,
        lowStockThreshold: p.lowStockThreshold,
        stockStatus: p.stockStatus,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        categoryId: p.categoryId ?? '',
        categoryName: p.category?.nameEn ?? '',
        imageUrl: p.imageUrl ?? '',
        createdAt: p.createdAt,
      });
    }

    // Alternate row shading
    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const color = rowNum % 2 === 0 ? 'FF111111' : 'FF0A0A0A';
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color },
        };
        cell.font = { color: { argb: 'FFE0E0E0' }, size: 10 };
      });
    });

    return wb.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
  }

  async exportCategories(): Promise<ExcelJS.Buffer> {
    const categories = await this.categoryRepo.find({
      relations: ['products'],
      order: { id: 'ASC' },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Photo House El Eraki';
    wb.created = new Date();

    const sheet = wb.addWorksheet('Categories', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = CATEGORY_COLUMNS;
    styleHeader(sheet);

    for (const c of categories) {
      sheet.addRow({
        id: c.id,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        description: c.description ?? '',
        productCount: c.products?.length ?? 0,
        createdAt: c.createdAt,
      });
    }

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const color = rowNum % 2 === 0 ? 'FF111111' : 'FF0A0A0A';
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color },
        };
        cell.font = { color: { argb: 'FFE0E0E0' }, size: 10 };
      });
    });

    return wb.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
  }

  // ── IMPORT ────────────────────────────────────────────────────────────────

  async importProducts(buffer: ArrayBuffer): Promise<ImportResultDto> {
    const wb = new ExcelJS.Workbook();

    await wb.xlsx.load(buffer);

    const sheet = wb.worksheets[0];
    if (!sheet) throw new BadRequestException('No worksheet found in file');

    // Build header→column index map from row 1
    const headers: Record<string, number> = {};
    sheet.getRow(1).eachCell((cell, colNum) => {
      headers[String(cell.value).trim()] = colNum;
    });

    const required = ['Name EN', 'Name AR', 'Price', 'Stock Qty'];
    for (const h of required) {
      if (!headers[h])
        throw new BadRequestException(`Missing required column: "${h}"`);
    }

    const result: ImportResultDto = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);

      // Skip completely empty rows
      const nameEn = String(row.getCell(headers['Name EN']).value ?? '').trim();
      if (!nameEn) continue;

      try {
        const nameAr = String(
          row.getCell(headers['Name AR']).value ?? '',
        ).trim();
        const price = num(row.getCell(headers['Price']).value);
        const stockQty = num(row.getCell(headers['Stock Qty']).value);
        const sku = headers['SKU']
          ? String(row.getCell(headers['SKU']).value ?? '').trim() || null
          : null;

        // Resolve category by ID or name
        let categoryId: string | null = null;
        if (headers['Category ID']) {
          const rawCatId = row.getCell(headers['Category ID']).value;
          if (rawCatId) {
            const cat = await this.categoryRepo.findOne({
              where: { id: String(rawCatId) },
            });
            if (cat) categoryId = cat.id;
          }
        }

        // Upsert: match on SKU if present, else nameEn
        let existing: Product | null = null;
        if (sku) {
          existing = await this.productRepo.findOne({ where: { sku } });
        }
        if (!existing) {
          existing = await this.productRepo.findOne({ where: { nameEn } });
        }

        const payload: Partial<Product> = {
          nameEn,
          nameAr: nameAr || nameEn,
          price,
          stockQuantity: stockQty,
          sku: sku ?? undefined,
          descriptionEn: headers['Description EN']
            ? String(
                row.getCell(headers['Description EN']).value ?? '',
              ).trim() || undefined
            : undefined,
          descriptionAr: headers['Description AR']
            ? String(
                row.getCell(headers['Description AR']).value ?? '',
              ).trim() || undefined
            : undefined,
          lowStockThreshold: headers['Low Stock Threshold']
            ? num(row.getCell(headers['Low Stock Threshold']).value, 10)
            : undefined,
          isFeatured: headers['Is Featured']
            ? bool(row.getCell(headers['Is Featured']).value)
            : undefined,
          isActive: headers['Is Active']
            ? bool(row.getCell(headers['Is Active']).value)
            : undefined,
          categoryId: categoryId ?? undefined,
        };

        // Recalculate stock status
        const threshold =
          payload.lowStockThreshold ?? existing?.lowStockThreshold ?? 10;
        if (stockQty === 0) {
          payload.stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (stockQty <= threshold) {
          payload.stockStatus = StockStatus.LOW_STOCK;
        } else {
          payload.stockStatus = StockStatus.IN_STOCK;
        }

        if (existing) {
          await this.productRepo.save({ ...existing, ...payload });
          result.updated++;
        } else {
          await this.productRepo.save(this.productRepo.create(payload));
          result.inserted++;
        }
      } catch (err) {
        result.errors.push({ row: rowNum, message: (err as Error).message });
        result.skipped++;
      }
    }

    return result;
  }

  // Todo: Implement importCategories similarly, with appropriate adjustments for category fields
  async importCategories(buffer: Buffer): Promise<ImportResultDto> {
    const wb = new ExcelJS.Workbook();
    // await wb.xlsx.load(buffer);

    const sheet = wb.worksheets[0];
    if (!sheet) throw new BadRequestException('No worksheet found in file');

    const headers: Record<string, number> = {};
    sheet.getRow(1).eachCell((cell, colNum) => {
      headers[String(cell.value).trim()] = colNum;
    });

    if (!headers['Name EN'])
      throw new BadRequestException('Missing required column: "Name EN"');

    const result: ImportResultDto = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);
      const nameEn = String(row.getCell(headers['Name EN']).value ?? '').trim();
      if (!nameEn) continue;

      try {
        const nameAr = headers['Name AR']
          ? String(row.getCell(headers['Name AR']).value ?? '').trim() || nameEn
          : nameEn;
        const description = headers['Description']
          ? String(row.getCell(headers['Description']).value ?? '').trim() ||
            undefined
          : undefined;

        // Upsert on nameEn
        const existing = await this.categoryRepo.findOne({ where: { nameEn } });

        const payload: Partial<Category> = { nameEn, nameAr, description };

        if (existing) {
          await this.categoryRepo.save({ ...existing, ...payload });
          result.updated++;
        } else {
          await this.categoryRepo.save(this.categoryRepo.create(payload));
          result.inserted++;
        }
      } catch (err) {
        result.errors.push({ row: rowNum, message: (err as Error).message });
        result.skipped++;
      }
    }

    return result;
  }
  // ── GOOGLE SHEETS: PUSH (DB → Sheet) ──────────────────────────────────────

  async pushProductsToSheet(
    spreadsheetId: string,
    sheetName = 'Products',
  ): Promise<{ synced: number }> {
    const products = await this.productRepo.find({
      relations: ['category'],
      order: { id: 'ASC' },
    });

    const headers = [
      'ID',
      'Name EN',
      'Name AR',
      'Description EN',
      'Description AR',
      'Price',
      'SKU',
      'Stock Qty',
      'Sold Qty',
      'Low Stock Threshold',
      'Stock Status',
      'Is Featured',
      'Is Active',
      'Category ID',
      'Category Name',
      'Image URL',
      'Created At',
    ];

    const rows = products.map((p) => [
      p.id,
      p.nameEn,
      p.nameAr,
      p.descriptionEn ?? '',
      p.descriptionAr ?? '',
      Number(p.price),
      p.sku ?? '',
      p.stockQuantity,
      p.soldQuantity,
      p.lowStockThreshold,
      p.stockStatus,
      p.isFeatured,
      p.isActive,
      p.categoryId ?? '',
      p.category?.nameEn ?? '',
      p.imageUrl ?? '',
      p.createdAt.toISOString(),
    ]);

    await this.sheetsService.writeSheet(
      spreadsheetId,
      sheetName,
      headers,
      rows,
    );
    return { synced: products.length };
  }

  async pushCategoriesToSheet(
    spreadsheetId: string,
    sheetName = 'Categories',
  ): Promise<{ synced: number }> {
    const categories = await this.categoryRepo.find({
      relations: ['products'],
      order: { id: 'ASC' },
    });

    const headers = [
      'ID',
      'Name EN',
      'Name AR',
      'Description',
      'Products #',
      'Created At',
    ];

    const rows = categories.map((c) => [
      c.id,
      c.nameEn,
      c.nameAr,
      c.description ?? '',
      c.products?.length ?? 0,
      c.createdAt.toISOString(),
    ]);

    await this.sheetsService.writeSheet(
      spreadsheetId,
      sheetName,
      headers,
      rows,
    );
    return { synced: categories.length };
  }

  // ── GOOGLE SHEETS: PULL (Sheet → DB upsert) ───────────────────────────────

  async pullProductsFromSheet(
    spreadsheetId: string,
    sheetName = 'Products',
  ): Promise<ImportResultDto> {
    const { headers, rows } = await this.sheetsService.readSheet(
      spreadsheetId,
      sheetName,
    );

    if (rows.length === 0)
      return { inserted: 0, updated: 0, skipped: 0, errors: [] };

    // Build header → column index map
    const col: Record<string, number> = {};
    headers.forEach((h, i) => {
      col[h.trim()] = i;
    });

    const required = ['Name EN', 'Name AR', 'Price', 'Stock Qty'];
    for (const h of required) {
      if (col[h] === undefined)
        throw new BadRequestException(`Missing required column: "${h}"`);
    }

    const result: ImportResultDto = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is headers

      const nameEn = String(row[col['Name EN']] ?? '').trim();
      if (!nameEn) continue;

      try {
        const nameAr = String(row[col['Name AR']] ?? '').trim() || nameEn;
        const price = Number(row[col['Price']] ?? 0);
        const stockQty = Number(row[col['Stock Qty']] ?? 0);
        const sku =
          col['SKU'] !== undefined
            ? String(row[col['SKU']] ?? '').trim() || null
            : null;

        // Resolve category
        let categoryId: string | null = null;
        if (col['Category ID'] !== undefined) {
          const rawId = row[col['Category ID']];
          if (rawId) {
            const cat = await this.categoryRepo.findOne({
              where: { id: String(rawId) },
            });
            if (cat) categoryId = cat.id;
          }
        }

        // Upsert: match on SKU first, then nameEn
        let existing: Product | null = null;
        if (sku) existing = await this.productRepo.findOne({ where: { sku } });
        if (!existing)
          existing = await this.productRepo.findOne({ where: { nameEn } });

        const threshold =
          col['Low Stock Threshold'] !== undefined
            ? Number(row[col['Low Stock Threshold']] ?? 10)
            : (existing?.lowStockThreshold ?? 10);

        const stockStatus =
          stockQty === 0
            ? StockStatus.OUT_OF_STOCK
            : stockQty <= threshold
              ? StockStatus.LOW_STOCK
              : StockStatus.IN_STOCK;

        const boolCell = (key: string, fallback: boolean): boolean => {
          if (col[key] === undefined) return fallback;
          const v = row[col[key]];
          if (typeof v === 'boolean') return v;
          return String(v).toLowerCase() === 'true' || String(v) === '1';
        };

        const payload: Partial<Product> = {
          nameEn,
          nameAr,
          price,
          stockQuantity: stockQty,
          stockStatus,
          sku: sku ?? undefined,
          lowStockThreshold: threshold,
          descriptionEn:
            col['Description EN'] !== undefined
              ? String(row[col['Description EN']] ?? '').trim() || undefined
              : undefined,
          descriptionAr:
            col['Description AR'] !== undefined
              ? String(row[col['Description AR']] ?? '').trim() || undefined
              : undefined,
          isFeatured: boolCell('Is Featured', existing?.isFeatured ?? false),
          isActive: boolCell('Is Active', existing?.isActive ?? true),
          categoryId: categoryId ?? undefined,
        };

        if (existing) {
          await this.productRepo.save({ ...existing, ...payload });
          result.updated++;
        } else {
          await this.productRepo.save(this.productRepo.create(payload));
          result.inserted++;
        }
      } catch (err) {
        result.errors.push({ row: rowNum, message: (err as Error).message });
        result.skipped++;
      }
    }

    return result;
  }

  async pullCategoriesFromSheet(
    spreadsheetId: string,
    sheetName = 'Categories',
  ): Promise<ImportResultDto> {
    const { headers, rows } = await this.sheetsService.readSheet(
      spreadsheetId,
      sheetName,
    );

    if (rows.length === 0)
      return { inserted: 0, updated: 0, skipped: 0, errors: [] };

    const col: Record<string, number> = {};
    headers.forEach((h, i) => {
      col[h.trim()] = i;
    });

    if (col['Name EN'] === undefined)
      throw new BadRequestException('Missing required column: "Name EN"');

    const result: ImportResultDto = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const nameEn = String(row[col['Name EN']] ?? '').trim();
      if (!nameEn) continue;

      try {
        const nameAr =
          col['Name AR'] !== undefined
            ? String(row[col['Name AR']] ?? '').trim() || nameEn
            : nameEn;
        const description =
          col['Description'] !== undefined
            ? String(row[col['Description']] ?? '').trim() || undefined
            : undefined;

        const existing = await this.categoryRepo.findOne({ where: { nameEn } });
        const payload: Partial<Category> = { nameEn, nameAr, description };

        if (existing) {
          await this.categoryRepo.save({ ...existing, ...payload });
          result.updated++;
        } else {
          await this.categoryRepo.save(this.categoryRepo.create(payload));
          result.inserted++;
        }
      } catch (err) {
        result.errors.push({ row: rowNum, message: (err as Error).message });
        result.skipped++;
      }
    }

    return result;
  }
}
