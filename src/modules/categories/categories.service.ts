import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../db/entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

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

  async findOne(id: number): Promise<Category> {
    const cat = await this.repo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    return cat;
  }

  // ── Admin ────────────────────────────────────────────────────────────────
  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.repo.findOne({ where: { nameEn: dto.nameEn } });
    if (exists)
      throw new ConflictException('Category with this name already exists');
    const cat = this.repo.create(dto);
    return this.repo.save(cat);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOne(id);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { message: `Category #${id} deleted successfully` };
  }
}
