import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/db/entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

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

  // ── Admin ────────────────────────────────────────────────────────────────
  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.repo.findOne({ where: { nameEn: dto.nameEn } });
    if (exists)
      throw new ConflictException('Category with this name already exists');
    const cat = this.repo.create(dto);
    return await this.repo.save(cat);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOne(id);
    Object.assign(cat, dto);
    return await this.repo.save(cat);
  }

  async remove(id: string): Promise<{ message: string }> {
    const cat = await this.repo.findOne({
      where: { id },
      select: { id: true },
    });

    await this.repo.remove(cat);
    return { message: `Category #${id} deleted successfully` };
  }
}
