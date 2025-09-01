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

  // Enable CORS for frontend and allow credentials for cookies
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : process.env.NODE_ENV === 'production'
      ? ['https://eduai-web.onrender.com']
      : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

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

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EDU AI API')
    .setDescription(
      'Comprehensive API for EDU AI educational platform including courses, exams, AI tutoring, forums, and more',
    )
    .setVersion('1.0.0')
    .addServer(
      process.env.NODE_ENV === 'production'
        ? 'https://eduai-api.onrender.com'
        : 'http://localhost:4000',
    )
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Courses', 'Course management and enrollment')
    .addTag('Exams', 'Exam system and assessments')
    .addTag('AI', 'AI tutoring and assistance')
    .addTag('Forums', 'Discussion forums and Q&A')
    .addTag('Profile', 'User profiles and settings')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // Socket.IO Redis adapter - temporarily disabled to allow startup without Redis
  // const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  // app.useWebSocketAdapter(new RedisIoAdapter(app, redisUrl));

  const port = Number(process.env.PORT ?? 4000);
  try {
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error(`❌ Failed to start server on port ${port}:`, error);
    process.exit(1);
  }
}
void bootstrap();
