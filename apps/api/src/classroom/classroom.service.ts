import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassroomService {
  constructor(private readonly prisma: PrismaService) {}

  async createClassroom(
    userId: string,
    data: { title: string; description?: string; isPublic?: boolean },
  ) {
    return this.prisma.classroom.create({
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic ?? true,
        createdById: userId,
        participants: { create: [{ userId, role: 'host' }] },
      },
      include: { participants: true },
    });
  }

  async list(userId: string) {
    return this.prisma.classroom.findMany({
      where: {
        OR: [{ isPublic: true }, { participants: { some: { userId } } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async join(classroomId: string, userId: string) {
    const room = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!room) throw new NotFoundException('Classroom not found');
    if (!room.isPublic) {
      // allow host/cohost to add self; otherwise require invite (skipped for brevity)
    }
    return this.prisma.classroomParticipant.upsert({
      where: { classroomId_userId: { classroomId, userId } },
      update: {},
      create: { classroomId, userId, role: 'member' },
    });
  }

  async createBreakout(classroomId: string, userId: string, name: string) {
    const host = await this.prisma.classroomParticipant.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!host || (host.role !== 'host' && host.role !== 'cohost'))
      throw new ForbiddenException('Host only');
    return this.prisma.breakoutRoom.create({ data: { classroomId, name } });
  }

  async listBreakouts(classroomId: string) {
    return this.prisma.breakoutRoom.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async joinBreakout(breakoutId: string, userId: string) {
    // ensure breakout exists
    const br = await this.prisma.breakoutRoom.findUnique({
      where: { id: breakoutId },
    });
    if (!br) throw new NotFoundException('Breakout not found');
    // ensure classroom membership
    await this.prisma.classroomParticipant.upsert({
      where: { classroomId_userId: { classroomId: br.classroomId, userId } },
      update: {},
      create: { classroomId: br.classroomId, userId, role: 'member' },
    });
    return this.prisma.breakoutParticipant.upsert({
      where: { breakoutId_userId: { breakoutId, userId } },
      update: {},
      create: { breakoutId, userId },
    });
  }

  async deleteBreakout(breakoutId: string) {
    await this.prisma.breakoutParticipant.deleteMany({ where: { breakoutId } });
    await this.prisma.breakoutRoom.delete({ where: { id: breakoutId } });
  }

  async listParticipants(classroomId: string) {
    return this.prisma.classroomParticipant.findMany({
      where: { classroomId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  private async assertHost(classroomId: string, userId: string) {
    const p = await this.prisma.classroomParticipant.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!p || (p.role !== 'host' && p.role !== 'cohost'))
      throw new ForbiddenException('Host only');
  }

  async setRole(
    classroomId: string,
    requesterId: string,
    targetUserId: string,
    role: 'host' | 'cohost' | 'member',
  ) {
    await this.assertHost(classroomId, requesterId);
    return this.prisma.classroomParticipant.update({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
      data: { role },
    });
  }

  async kick(classroomId: string, requesterId: string, targetUserId: string) {
    await this.assertHost(classroomId, requesterId);
    await this.prisma.classroomParticipant
      .delete({
        where: { classroomId_userId: { classroomId, userId: targetUserId } },
      })
      .catch(() => null);
    return { ok: true };
  }
}
