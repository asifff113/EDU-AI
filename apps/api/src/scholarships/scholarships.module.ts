import { Module } from '@nestjs/common';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScholarshipsGateway } from './scholarships.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService, PrismaService, ScholarshipsGateway],
  exports: [ScholarshipsService],
})
export class ScholarshipsModule {}
