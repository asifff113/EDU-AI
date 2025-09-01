import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WellnessService {
  constructor(private prisma: PrismaService) {}

  async logStudy(userId: string, payload: any) {
    const db: any = this.prisma as any;
    const log = await db.studyLog.create({
      data: {
        userId,
        startedAt: payload?.startedAt
          ? new Date(payload.startedAt)
          : new Date(),
        duration: payload?.duration ?? 0,
        subject: payload?.subject,
        mood: payload?.mood,
        notes: payload?.notes,
      },
    });
    // Award small points for consistent learners
    try {
      const points = Math.min(
        10,
        Math.floor((payload?.duration ?? 0) / 30) * 2 + 1,
      );
      await db.earnEvent.create({
        data: {
          userId,
          type: 'study_log',
          points,
          data: { duration: payload?.duration, subject: payload?.subject },
        },
      });
      // 7-day streak achievement (simple check: 7 logs in 7 days)
      try {
        const since = new Date();
        since.setDate(since.getDate() - 6);
        const count = await db.studyLog.count({
          where: { userId, startedAt: { gte: since } },
        });
        if (count >= 7) {
          const ach = await db.achievement.findUnique({
            where: { code: 'study_streak_7' },
          });
          if (ach) {
            await db.userAchievement.upsert({
              where: {
                userId_achievementId: { userId, achievementId: ach.id },
              },
              update: {},
              create: { userId, achievementId: ach.id },
            });
          }
        }
      } catch {}
      if (points >= 10) {
        await db.scholarship.create({
          data: {
            userId,
            kind: 'activity',
            points,
            amount: 0,
            reason: 'Consistent study activity',
          },
        });
      }
    } catch {}
    return log;
  }

  async listLogs(userId: string) {
    const db: any = this.prisma as any;
    return db.studyLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async listMindfulness() {
    const db: any = this.prisma as any;
    const count = await db.mindfulnessContent.count();
    if (count === 0) {
      await db.mindfulnessContent.createMany({
        data: [
          {
            title: '5-minute Breathing',
            kind: 'meditation',
            duration: 5,
            mediaUrl: '',
          },
          {
            title: 'Pomodoro Focus (25m)',
            kind: 'focus',
            duration: 25,
            mediaUrl: '',
          },
          {
            title: 'Stretch Break (3m)',
            kind: 'break',
            duration: 3,
            mediaUrl: '',
          },
        ],
      });
    }
    return db.mindfulnessContent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listCounselorSlots() {
    const db: any = this.prisma as any;
    return db.counselorSlot.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async bookSlot(id: string, userId: string) {
    const db: any = this.prisma as any;
    return db.counselorSlot.update({
      where: { id },
      data: { isBooked: true, bookedBy: userId },
    });
  }
}
