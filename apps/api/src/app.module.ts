import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AppGateway } from './gateway/app.gateway';
import { HealthModule } from './health/health.module';
import { DbModule } from './db/db.module';
import { LeadsModule } from './leads/leads.module';
import { AuthModule } from './auth/auth.module';
import { AIModule } from './ai/ai.module';
import { ProfileModule } from './profile/profile.module';
import { SettingsModule } from './settings/settings.module';
import { ResourcesModule } from './resources/resources.module';
import { ExamModule } from './exam/exam.module';
import { CourseModule } from './course/course.module';
import { GroupsModule } from './groups/groups.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { ClassroomModule } from './classroom/classroom.module';
import { ForumModule } from './forum/forum.module';
import { CertificatesModule } from './certificates/certificates.module';
import { JobsModule } from './jobs/jobs.module';
import { MentorshipModule } from './mentorship/mentorship.module';
import { WellnessModule } from './wellness/wellness.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ScholarshipsModule } from './scholarships/scholarships.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GamificationModule } from './gamification/gamification.module';
import { GoalsModule } from './goals/goals.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    HealthModule,
    DbModule,
    LeadsModule,
    AuthModule,
    AIModule,
    ProfileModule,
    SettingsModule,
    ResourcesModule,
    ExamModule,
    CourseModule,
    GroupsModule,
    ChatModule,
    AdminModule,
    ClassroomModule,
    ForumModule,
    CertificatesModule,
    JobsModule,
    MentorshipModule,
    WellnessModule,
    SubscriptionsModule,
    ScholarshipsModule,
    NotificationsModule,
    GamificationModule,
    GoalsModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
