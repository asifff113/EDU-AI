import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [users, courses, resources] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.resource.count(),
    ]);
    return { users, courses, resources };
  }

  async listUsers({ role, search }: { role?: Role; search?: string }) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          role ? { role } : {},
          search
            ? {
                OR: [
                  { email: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async setUserRole(userId: string, role: Role) {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }
}
