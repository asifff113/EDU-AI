import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.warn(
        'Database connection failed, continuing without database:',
        error instanceof Error ? error.message : String(error),
      );
      // Don't throw the error - allow the application to start without database
    }

    // Ensure minimal gamification tables exist without relying on migrations (for dev/demo)
    try {
      await (this as any).$executeRawUnsafe(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        CREATE TABLE IF NOT EXISTS "GamificationProfile" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" text UNIQUE NOT NULL,
          "xp" integer NOT NULL DEFAULT 0,
          "points" integer NOT NULL DEFAULT 0,
          "level" integer NOT NULL DEFAULT 1,
          "rankName" text NOT NULL DEFAULT 'Bronze',
          "streakCurrent" integer NOT NULL DEFAULT 0,
          "streakBest" integer NOT NULL DEFAULT 0,
          "lastEarnAt" timestamp,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );
        DO $$ BEGIN
          ALTER TABLE "GamificationProfile"
          ADD CONSTRAINT fk_gp_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        CREATE TABLE IF NOT EXISTS "Achievement" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "code" text UNIQUE NOT NULL,
          "name" text NOT NULL,
          "description" text,
          "icon" text,
          "xpReward" integer NOT NULL DEFAULT 0,
          "pointsReward" integer NOT NULL DEFAULT 0,
          "criteria" jsonb,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "UserAchievement" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" text NOT NULL,
          "achievementId" text NOT NULL,
          "createdAt" timestamp NOT NULL DEFAULT now()
        );
        DO $$ BEGIN
          CREATE UNIQUE INDEX IF NOT EXISTS user_ach_unique ON "UserAchievement" ("userId", "achievementId");
        EXCEPTION WHEN duplicate_table THEN NULL; END $$;
        DO $$ BEGIN
          CREATE INDEX IF NOT EXISTS user_ach_idx ON "UserAchievement" ("userId", "createdAt");
        EXCEPTION WHEN duplicate_table THEN NULL; END $$;
        DO $$ BEGIN
          ALTER TABLE "UserAchievement"
            ADD CONSTRAINT fk_ua_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          ALTER TABLE "UserAchievement"
            ADD CONSTRAINT fk_ua_ach FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        CREATE TABLE IF NOT EXISTS "Rank" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" text UNIQUE NOT NULL,
          "minXp" integer NOT NULL DEFAULT 0,
          "order" integer NOT NULL DEFAULT 0,
          "icon" text,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );
      `);
    } catch {}

    // Ensure Goals/Habits and Skills tables for dev
    try {
      await (this as any).$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Goal" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" text NOT NULL,
          "title" text NOT NULL,
          "targetMinutes" integer NOT NULL DEFAULT 30,
          "dueDate" timestamp,
          "habitKey" text,
          "createdAt" timestamp NOT NULL DEFAULT now()
        );
        DO $$ BEGIN
          CREATE INDEX IF NOT EXISTS idx_goal_user ON "Goal" ("userId", "createdAt");
        EXCEPTION WHEN duplicate_table THEN NULL; END $$;
        
        CREATE TABLE IF NOT EXISTS "GoalLog" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" text NOT NULL,
          "goalId" text NOT NULL,
          "minutes" integer NOT NULL DEFAULT 15,
          "date" date NOT NULL DEFAULT CURRENT_DATE
        );
        DO $$ BEGIN
          CREATE INDEX IF NOT EXISTS idx_goal_log_user ON "GoalLog" ("userId", "date");
        EXCEPTION WHEN duplicate_table THEN NULL; END $$;

        CREATE TABLE IF NOT EXISTS "SkillNode" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "title" text NOT NULL,
          "description" text,
          "parentId" text
        );
        DO $$ BEGIN
          ALTER TABLE "SkillNode" ADD CONSTRAINT fk_skill_parent FOREIGN KEY ("parentId") REFERENCES "SkillNode"("id") ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        CREATE TABLE IF NOT EXISTS "SkillProgress" (
          "userId" text NOT NULL,
          "nodeId" text NOT NULL,
          "completed" boolean NOT NULL DEFAULT false,
          "completedAt" timestamp,
          PRIMARY KEY ("userId", "nodeId")
        );
      `);
    } catch {}

    // Lightweight middleware to mirror EarnEvent/Scholarship into gamification profile
    try {
      const anySelf: any = this as any;
      if (typeof anySelf.$use === 'function')
        anySelf.$use(async (params: any, next: any) => {
          const result = await next(params);
          try {
            if (
              params.model === 'EarnEvent' &&
              (params.action === 'create' || params.action === 'createMany')
            ) {
              const records = Array.isArray(result) ? result : [result];
              for (const rec of records) {
                if (rec?.userId) {
                  const db: any = this as any;
                  await db.gamificationProfile.upsert({
                    where: { userId: rec.userId },
                    update: {},
                    create: { userId: rec.userId },
                  });
                  await db.gamificationProfile.update({
                    where: { userId: rec.userId },
                    data: {
                      points: { increment: rec.points || 0 },
                      xp: { increment: Math.max(0, rec.points || 0) },
                      lastEarnAt: new Date(),
                    },
                  });
                }
              }
            }
            if (params.model === 'Scholarship' && params.action === 'create') {
              const rec: any = result;
              if (rec?.userId) {
                const db: any = this as any;
                await db.gamificationProfile.upsert({
                  where: { userId: rec.userId },
                  update: {},
                  create: { userId: rec.userId },
                });
                await db.gamificationProfile.update({
                  where: { userId: rec.userId },
                  data: {
                    points: { increment: rec.points || 0 },
                    xp: { increment: Math.max(0, rec.points || 0) },
                    lastEarnAt: new Date(),
                  },
                });
              }
            }
          } catch {}
          return result;
        });
    } catch {}
  }

  enableShutdownHooks(_app: INestApplication): void {
    // Removed $on('beforeExit') due to Prisma type error. If needed, add custom shutdown logic here.
  }
}
