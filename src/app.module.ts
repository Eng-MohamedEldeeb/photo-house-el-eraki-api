import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CloudinaryModule } from './common/services/cloudinary/cloudinary.module';
import { Admin } from './db/entities/admin.entity';
import { Product } from './db/entities/product.entity';
import { Category } from './db/entities/category.entity';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Admin, Product, Category],
        synchronize: config.get('NODE_ENV') !== 'production', // auto-migrate in dev
        autoLoadEntities: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
