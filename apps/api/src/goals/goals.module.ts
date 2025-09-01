import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsGateway } from './goals.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GoalsController],
  providers: [GoalsService, PrismaService, GoalsGateway],
  exports: [GoalsService],
})
export class GoalsModule {}
