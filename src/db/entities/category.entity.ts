import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Image ────────────────────────────────────────────
  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  imagePublicId: string; // Cloudinary public_id for deletion

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
export const CategoryModel = TypeOrmModule.forFeature([Category]);
