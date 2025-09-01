import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsGateway } from './goals.gateway';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private gateway: GoalsGateway,
  ) {}

  private db() {
    return this.prisma as any;
  }

  async list(userId: string) {
    const rows = await this.db()
      .$queryRaw`SELECT "id","userId","title","targetMinutes","dueDate","habitKey","createdAt" FROM "Goal" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`;
    return rows as any[];
  }

  async upsertGoal(userId: string, payload: any) {
    const title = payload.title as string;
    const targetMinutes = Number(payload.targetMinutes ?? 30);
    const dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
    const habitKey = payload.habitKey ?? null;
    const rows = await this.db()
      .$queryRaw`INSERT INTO "Goal" ("userId","title","targetMinutes","dueDate","habitKey") VALUES (${userId}, ${title}, ${targetMinutes}, ${dueDate}, ${habitKey}) RETURNING "id","userId","title","targetMinutes","dueDate","habitKey","createdAt"`;
    const goal = Array.isArray(rows) ? rows[0] : rows;
    try {
      this.gateway.server?.to(userId).emit('goals:update', goal);
    } catch {}
    return goal;
  }

  async logProgress(userId: string, payload: any) {
    const goalId = payload.goalId as string;
    const minutes = Number(payload.minutes ?? 15);
    const date = payload.date ? new Date(payload.date) : new Date();
    const rows = await this.db()
      .$queryRaw`INSERT INTO "GoalLog" ("userId","goalId","minutes","date") VALUES (${userId}, ${goalId}, ${minutes}, ${date}) RETURNING "id","userId","goalId","minutes","date"`;
    const log = Array.isArray(rows) ? rows[0] : rows;
    try {
      this.gateway.server?.to(userId).emit('goals:log', log);
    } catch {}
    return log;
  }

  async streak(userId: string) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const logs = (await this.db()
      .$queryRaw`SELECT "date" FROM "GoalLog" WHERE "userId" = ${userId} AND "date" >= ${start}`) as any[];
    const days = new Set(logs.map((l: any) => new Date(l.date).toDateString()));
    let current = 0;
    for (let i = 0; i < 1000; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (days.has(d.toDateString())) current++;
      else break;
    }
    const best = Math.max(current, logs.length > 0 ? 7 : 0);
    return { current, best };
  }
}
