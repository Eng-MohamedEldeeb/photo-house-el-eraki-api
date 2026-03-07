import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './common/services/cloudinary/cloudinary.module';
import { Admin } from './db/entities/admin.entity';
import { Product } from './db/entities/product.entity';
import { Category } from './db/entities/category.entity';
import { resolve } from 'path';
import { ClientModule } from './modules/client/client.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ envFilePath: resolve('.env'), isGlobal: true }),

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
    AdminModule,
    ClientModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
