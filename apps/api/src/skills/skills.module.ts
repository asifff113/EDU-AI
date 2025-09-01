import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SkillsGateway } from './skills.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SkillsController],
  providers: [SkillsService, PrismaService, SkillsGateway],
  exports: [SkillsService],
})
export class SkillsModule {}
