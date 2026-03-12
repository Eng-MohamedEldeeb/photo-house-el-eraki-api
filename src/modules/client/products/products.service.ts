import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product, StockStatus } from '../../../db/entities/product.entity';
import { ProductQueryDto } from './dto/query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async handleProductView(productId: string) {
    await this.repo.increment({ id: productId }, 'viewCount', 1);
  }
  // ── Public ───────────────────────────────────────────────────────────────
  async findAll(query: ProductQueryDto) {
    const { search, categoryId, stockStatus, page = 1, limit = 12 } = query;
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

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id, isActive: true } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    this.handleProductView(id); // Increment views asynchronously
    return product;
  }

  async findFeatured(): Promise<Product> {
    return this.repo.findOne({
      where: { isFeatured: true, isActive: true },
    });
  }
}
