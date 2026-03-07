import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Product } from 'src/db/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IsExistedProduct implements CanActivate {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { id }: { id: string } = context
      .switchToHttp()
      .getRequest<Request<null, null, null, { id: string }>>().query;

    const isExistedProduct = await this.repo.findOne({
      where: { id },
      select: { id: true },
    });

    if (!isExistedProduct) throw new NotFoundException('Product Not Found');

    return true;
  }
}
