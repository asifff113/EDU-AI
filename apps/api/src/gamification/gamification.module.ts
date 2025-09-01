import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationGateway } from './gamification.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GamificationController],
  providers: [GamificationService, PrismaService, GamificationGateway],
  exports: [GamificationService],
})
export class GamificationModule {}
