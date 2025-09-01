import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationGateway } from './gamification.gateway';

type AwardInput = {
  userId: string;
  xp?: number;
  points?: number;
  reason?: string;
};

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: GamificationGateway,
  ) {}

  async ensureProfile(userId: string) {
    const db: any = this.prisma as any;
    return db.gamificationProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getProfile(userId: string) {
    await this.ensureProfile(userId);
    const db: any = this.prisma as any;
    return db.gamificationProfile.findUnique({ where: { userId } });
  }

  async addProgress(input: AwardInput) {
    const xpDelta = input.xp ?? 0;
    const ptDelta = input.points ?? 0;
    const profile = await this.ensureProfile(input.userId);

    // Update profile totals
    const db: any = this.prisma as any;
    const updated = await db.gamificationProfile.update({
      where: { id: profile.id },
      data: {
        xp: { increment: xpDelta },
        points: { increment: ptDelta },
        lastEarnAt: new Date(),
      },
    });

    // Recalculate level and rank
    const newLevel = this.calculateLevel(updated.xp);
    let rankName = updated.rankName;
    if (newLevel !== updated.level) {
      const rank = await this.getRankForXp(updated.xp);
      rankName = rank?.name || rankName;
      await db.gamificationProfile.update({
        where: { id: profile.id },
        data: { level: newLevel, rankName },
      });
    }

    const fresh = await db.gamificationProfile.findUnique({
      where: { id: profile.id },
    });
    // Emit real-time update
    try {
      this.gateway.server?.to(input.userId).emit('gamification:update', {
        userId: input.userId,
        xpDelta,
        pointsDelta: ptDelta,
        profile: fresh,
      });
    } catch {}
    return fresh;
  }

  calculateLevel(totalXp: number): number {
    // simple XP curve: level n requires 100 * n^1.2 xp cumulative
    let level = 1;
    while (totalXp >= this.xpForLevel(level + 1)) level++;
    return level;
  }

  xpForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level - 1, 1.2));
  }

  async getRankForXp(xp: number) {
    const db: any = this.prisma as any;
    const ranks = await db.rank.findMany({ orderBy: { minXp: 'asc' } });
    let current = ranks[0];
    for (const r of ranks) {
      if (xp >= r.minXp) current = r;
      else break;
    }
    return current;
  }

  async awardAchievement(userId: string, code: string) {
    const db: any = this.prisma as any;
    const ach = await db.achievement.findUnique({ where: { code } });
    if (!ach) throw new Error('Achievement not found');
    await this.ensureProfile(userId);
    await db.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: ach.id } },
      update: {},
      create: { userId, achievementId: ach.id },
    });
    return this.addProgress({
      userId,
      xp: ach.xpReward,
      points: ach.pointsReward,
      reason: `achievement:${code}`,
    });
  }

  async getAchievements(userId: string) {
    await this.ensureProfile(userId);
    const db: any = this.prisma as any;
    const earned = await db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { createdAt: 'desc' },
    });
    return earned.map((e: any) => e.achievement);
  }

  async getLeaderboard(type: 'xp' | 'points', limit = 20) {
    const orderBy =
      type === 'xp' ? { xp: 'desc' as const } : { points: 'desc' as const };
    const db: any = this.prisma as any;
    const rows = await db.gamificationProfile.findMany({
      orderBy,
      take: Math.min(Math.max(limit, 1), 100),
      include: { user: true },
    });
    return rows.map((r: any) => ({
      userId: r.userId,
      name:
        `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim() ||
        r.user.email,
      xp: r.xp,
      points: r.points,
      level: r.level,
      rank: r.rankName,
    }));
  }
}
