import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  static connect() {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USERNAME'),
        password: cfg.get('DB_PASSWORD'),
        database: cfg.get('DB_NAME'),
        synchronize: cfg.get('NODE_ENV') !== 'production', // auto-migrate in dev
        migrationsRun: cfg.get('NODE_ENV') === 'production',
        migrations: ['dist/migrations/*.js'],
        entities: [Admin, Product, Category],
        autoLoadEntities: true,
        logging: false,
      }),
      inject: [ConfigService],
    });
  }
}
