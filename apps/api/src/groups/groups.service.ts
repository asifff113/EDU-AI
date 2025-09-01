import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(params: {
    name: string;
    description?: string;
    isPublic?: boolean;
    creatorId: string;
  }) {
    const group = await this.prisma.studyGroup.create({
      data: {
        name: params.name,
        description: params.description,
        isPublic: params.isPublic ?? true,
        createdById: params.creatorId,
        members: {
          create: [{ userId: params.creatorId, role: 'admin' }],
        },
      },
      include: { members: true },
    });
    return group;
  }

  async listGroups(options?: { search?: string; onlyPublic?: boolean }) {
    return this.prisma.studyGroup.findMany({
      where: {
        AND: [
          options?.onlyPublic ? { isPublic: true } : {},
          options?.search
            ? { name: { contains: options.search, mode: 'insensitive' } }
            : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true, messages: true } } },
    });
  }

  async getGroup(groupId: string) {
    const group = await this.prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
        _count: { select: { members: true, messages: true } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async joinGroup(groupId: string, userId: string) {
    const group = await this.prisma.studyGroup.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Group not found');
    if (!group.isPublic) throw new ForbiddenException('Group is private');
    return this.prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId, role: 'member' },
      update: {},
    });
  }

  async leaveGroup(groupId: string, userId: string) {
    await this.prisma.groupMember
      .delete({
        where: { groupId_userId: { groupId, userId } },
      })
      .catch(() => null);
    return { ok: true };
  }

  async postMessage(params: {
    groupId: string;
    senderId: string;
    content?: string;
    type?: string;
    fileUrl?: string;
  }) {
    // ensure membership; auto-add creator or auto-join public groups
    let member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: params.groupId, userId: params.senderId },
      },
    });
    if (!member) {
      const group = await this.prisma.studyGroup.findUnique({
        where: { id: params.groupId },
      });
      if (!group) throw new NotFoundException('Group not found');
      if (group.createdById === params.senderId || group.isPublic) {
        member = await this.prisma.groupMember.upsert({
          where: {
            groupId_userId: {
              groupId: params.groupId,
              userId: params.senderId,
            },
          },
          update: {},
          create: {
            groupId: params.groupId,
            userId: params.senderId,
            role: group.createdById === params.senderId ? 'admin' : 'member',
          },
        });
      } else {
        throw new ForbiddenException('Not a group member');
      }
    }
    const msg = await this.prisma.groupMessage.create({
      data: {
        groupId: params.groupId,
        senderId: params.senderId,
        content: params.content,
        type: params.type ?? 'text',
        fileUrl: params.fileUrl,
      },
    });
    return msg;
  }

  async listMessages(groupId: string) {
    return this.prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
