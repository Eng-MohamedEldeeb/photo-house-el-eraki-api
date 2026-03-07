import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Category } from 'src/db/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IsExistedCategory implements CanActivate {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { categoryId }: { categoryId: string } = context
      .switchToHttp()
      .getRequest<Request>().body;
    const isExistedCategory = await this.repo.findOne({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!isExistedCategory) throw new NotFoundException('Category Not Found');

    return true;
  }
}
