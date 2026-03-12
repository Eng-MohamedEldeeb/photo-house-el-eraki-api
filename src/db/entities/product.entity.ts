import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column({ nullable: true })
  descriptionEn: string;

  @Column({ nullable: true })
  descriptionAr: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  sku: string;

  // ── Stock ────────────────────────────────────────────
  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: 0 })
  soldQuantity: number;

  @Column({ default: 10 })
  lowStockThreshold: number; // alert when stock <= this

  @Column({
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.IN_STOCK,
  })
  stockStatus: StockStatus;

  // ── Image ────────────────────────────────────────────
  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  imagePublicId: string; // Cloudinary public_id for deletion

  // ── Flags ────────────────────────────────────────────
  @Column({ default: true })
  isFeatured: boolean;

  @Column({ default: true })
  isActive: boolean;

  // ── Relations ────────────────────────────────────────
  @ManyToOne(() => Category, (cat) => cat.products, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
export const ProductModel = TypeOrmModule.forFeature([Product]);
