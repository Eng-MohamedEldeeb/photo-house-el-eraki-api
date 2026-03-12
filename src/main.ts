import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import chalk from 'chalk';
import helmet from 'helmet';
import { globalErrorHandler } from './common/handlers/global-error.handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origin =
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5173';

  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.use(globalErrorHandler);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Photo House API running on port : ${chalk.yellow(port)}`);
}
bootstrap();
