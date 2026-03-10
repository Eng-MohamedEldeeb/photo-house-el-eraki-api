import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/db/entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { CloudinaryService } from 'src/common/utils/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly cloudinary: CloudinaryService,
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

    console.log({ img: dto });

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
    dto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<Category> {
    const cat = await this.findOne(id);

    if (file) {
      // Delete old image from Cloudinary
      if (cat.imagePublicId) {
        await this.cloudinary.deleteImage(cat.imagePublicId);
      }
      const { url, publicId } = await this.cloudinary.uploadImage(
        file,
        'photo-house/products',
      );
      cat.imageUrl = url;
      cat.imagePublicId = publicId;
    }

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
