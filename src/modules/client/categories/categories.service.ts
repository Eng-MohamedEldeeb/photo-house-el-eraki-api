import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../db/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────
  async findAll(): Promise<Category[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.repo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    return cat;
  }
}
