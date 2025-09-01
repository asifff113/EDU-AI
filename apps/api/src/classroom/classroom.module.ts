import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { ClassroomGateway } from './classroom.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClassroomController],
  providers: [ClassroomService, ClassroomGateway],
})
export class ClassroomModule {}
