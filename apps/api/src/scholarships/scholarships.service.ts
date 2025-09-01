import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScholarshipsService {
  constructor(private prisma: PrismaService) {}

  async ensureSeed() {
    // no-op for now
  }

  async listMine(userId: string) {
    const [awards, events, subs] = await Promise.all([
      this.prisma.scholarship.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.earnEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.findFirst({
        where: { userId, status: 'active' },
        include: { plan: true },
      }),
    ]);
    const totalPoints =
      awards.reduce((s, a) => s + (a.points || 0), 0) +
      events.reduce((s, e) => s + (e.points || 0), 0);
    return { totalPoints, awards, events, activeSubscription: subs };
  }

  async award(params: {
    userId: string;
    kind: string; // merit | activity | need | help | conversion | reward
    points?: number;
    amount?: number;
    benefitType?: string; // subscription | course | credit | grant
    benefitValue?: string;
    reason?: string;
    metadata?: any;
  }) {
    const award = await this.prisma.scholarship.create({
      data: {
        userId: params.userId,
        kind: params.kind,
        points: params.points ?? 0,
        amount: params.amount ?? 0,
        benefitType: params.benefitType,
        benefitValue: params.benefitValue,
        reason: params.reason,
        metadata: params.metadata,
      },
    });
    return award;
  }

  async recordEvent(userId: string, type: string, points: number, data?: any) {
    return this.prisma.earnEvent.create({
      data: { userId, type, points, data },
    });
  }
}
