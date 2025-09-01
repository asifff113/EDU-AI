import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async listPlans() {
    const count = await this.prisma.plan.count();
    if (count === 0) {
      await this.prisma.plan.createMany({
        data: [
          {
            name: 'Monthly',
            interval: 'monthly',
            price: 4.99,
            features: ['All basic features', 'Community access'],
          },
          {
            name: 'Annual',
            interval: 'yearly',
            price: 49.99,
            features: ['2 months free', 'Priority support'],
          },
          {
            name: 'Family',
            interval: 'family',
            price: 99.99,
            features: ['Up to 5 members', 'Family dashboard'],
          },
        ],
      });
    }
    return this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  }

  async subscribe(userId: string, planId: string) {
    const sub = await this.prisma.subscription.create({
      data: { userId, planId },
    });
    return sub;
  }

  async mySubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });
  }
}
