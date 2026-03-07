import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product, StockStatus } from '../../../db/entities/product.entity';
import { ProductQueryDto } from './dto/product.dto';
import { CloudinaryService } from '../../../common/services/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
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
}
