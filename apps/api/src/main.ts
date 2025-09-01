import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { RedisIoAdapter } from './gateway/redis-io.adapter';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend during development and allow credentials so
  // the server can set httpOnly cookies.
  const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  app.enableCors({ origin, credentials: true });

  // Cookie parser required to use res.cookie in controllers
  app.use(cookieParser());

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  // Serve static uploads (e.g., course files, avatars, resources)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Edu AI API')
    .setDescription('API documentation for Edu AI')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Socket.IO Redis adapter - temporarily disabled to allow startup without Redis
  // const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  // app.useWebSocketAdapter(new RedisIoAdapter(app, redisUrl));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}
void bootstrap();
