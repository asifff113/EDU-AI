import { Module } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MentorshipGateway } from './mentorship.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MentorshipController],
  providers: [MentorshipService, PrismaService, MentorshipGateway],
})
export class MentorshipModule {}
