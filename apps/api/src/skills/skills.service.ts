import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkillsGateway } from './skills.gateway';

@Injectable()
export class SkillsService {
  constructor(
    private prisma: PrismaService,
    private gateway: SkillsGateway,
  ) {}

  private db() {
    return this.prisma as any;
  }

  async getTree(userId: string) {
    const nodes = (await this.db()
      .$queryRaw`SELECT "id","title","description","parentId" FROM "SkillNode"`) as any[];
    // Build children array on client-side minimal
    const progress = (await this.db()
      .$queryRaw`SELECT "userId","nodeId","completed","completedAt" FROM "SkillProgress" WHERE "userId" = ${userId}`) as any[];
    return { nodes, progress };
  }

  async completeMilestone(userId: string, nodeId: string) {
    const now = new Date();
    await this.db().$executeRawUnsafe(
      `
      INSERT INTO "SkillProgress" ("userId","nodeId","completed","completedAt")
      VALUES ($1,$2,true,$3)
      ON CONFLICT ("userId","nodeId") DO UPDATE SET "completed" = EXCLUDED."completed", "completedAt" = EXCLUDED."completedAt"
    `,
      userId,
      nodeId,
      now,
    );
    const prog = { userId, nodeId, completed: true, completedAt: now };
    try {
      this.gateway.server?.to(userId).emit('skills:update', prog);
    } catch {}
    return prog;
  }
}
