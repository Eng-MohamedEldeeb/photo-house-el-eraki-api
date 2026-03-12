import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from './db/entities/category.entity';
import { Product } from './db/entities/product.entity';
import { Admin } from './db/entities/admin.entity';

dotenv.config({ path: '.env.production' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Admin, Category, Product],
  migrations: ['src/migrations/*.ts'],
});
/*
 * npx typeorm-ts-node-commonjs migration:generate src/migrations/InitialSchema -d src/data-source.ts
 * npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
 */
