import { Module } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { WellnessController } from './wellness.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WellnessGateway } from './wellness.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WellnessController],
  providers: [WellnessService, PrismaService, WellnessGateway],
})
export class WellnessModule {}
