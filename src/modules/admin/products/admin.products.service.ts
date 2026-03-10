import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';

import { Product, StockStatus } from 'src/db/entities/product.entity';
import { CloudinaryService } from 'src/common/utils/cloudinary/cloudinary.service';
import { ProductQueryDto, CreateProductDto, UpdateProductDto } from './dto';
import { UpdateStockDto } from './dto/update.dto';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────────
  private resolveStockStatus(product: Product): StockStatus {
    if (product.stockQuantity <= 0) return StockStatus.OUT_OF_STOCK;
    if (product.stockQuantity <= product.lowStockThreshold)
      return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  // ── Public ───────────────────────────────────────────────────────────────
  async findAll(query: ProductQueryDto) {
    const { search, categoryId, stockStatus, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (stockStatus) where.stockStatus = stockStatus;

    const options: FindManyOptions<Product> = {
      where: search
        ? [
            { ...where, nameEn: Like(`%${search}%`) },
            { ...where, nameAr: Like(`%${search}%`) },
          ]
        : where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    };

    const [products, total] = await this.repo.findAndCount(options);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id, isActive: true } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  async findAllAdmin(query: ProductQueryDto) {
    // Admin sees all products including inactive
    const { search, categoryId, stockStatus, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: {
      categoryId?: string;
      stockStatus?: string;
      isActive: boolean;
    } & Partial<Product> = { isActive: true };

    if (categoryId) where.categoryId = categoryId;
    if (stockStatus) where.stockStatus = stockStatus as StockStatus.IN_STOCK;

    const options: FindManyOptions<Product> = {
      where: search
        ? [
            { ...where, nameEn: Like(`%${search}%`) },
            { ...where, nameAr: Like(`%${search}%`) },
          ]
        : where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    };

    const [products, total] = await this.repo.findAndCount(options);

    return {
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: products,
    };
  }

  async create(dto: CreateProductDto): Promise<Product> {
    if (dto.image) {
      return await this.repo.save({
        ...dto,
        imageUrl: dto.image.url,
        imagePublicId: dto.image.publicId,
      });
    }

    return await this.repo.save(dto);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);

    if (file) {
      // Delete old image from Cloudinary
      if (product.imagePublicId) {
        await this.cloudinary.deleteImage(product.imagePublicId);
      }
      const { url, publicId } = await this.cloudinary.uploadImage(
        file,
        'photo-house/products',
      );
      product.imageUrl = url;
      product.imagePublicId = publicId;
    }

    Object.assign(product, dto);
    product.stockStatus = this.resolveStockStatus(product);
    return await this.repo.save(product);
  }

  async updateStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);

    product.stockQuantity = dto.stockQuantity;
    if (dto.soldQuantity !== undefined) product.soldQuantity = dto.soldQuantity;
    product.stockStatus = this.resolveStockStatus(product);
    return await this.repo.save(product);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);

    if (product.imagePublicId) {
      await this.cloudinary.deleteImage(product.imagePublicId);
    }

    await this.repo.remove(product);
    return { message: `Product #${id} deleted successfully` };
  }

  // Stock summary for dashboard
  async getStockSummary() {
    const total = await this.repo.count();
    const inStock = await this.repo.count({
      where: { stockStatus: StockStatus.IN_STOCK },
    });
    const lowStock = await this.repo.count({
      where: { stockStatus: StockStatus.LOW_STOCK },
    });
    const outOfStock = await this.repo.count({
      where: { stockStatus: StockStatus.OUT_OF_STOCK },
    });
    const sold = await this.repo
      .createQueryBuilder('p')
      .select('SUM(p.soldQuantity)', 'total')
      .getRawOne();

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
      totalSold: Number(sold?.total ?? 0),
    };
  }
}
