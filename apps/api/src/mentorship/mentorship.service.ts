import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MentorshipService {
  constructor(private prisma: PrismaService) {}

  listMentors = async (q?: string) => {
    const where: any = q
      ? {
          OR: [
            { user: { firstName: { contains: q, mode: 'insensitive' } } },
            { user: { lastName: { contains: q, mode: 'insensitive' } } },
            { expertise: { hasSome: [q] } },
            { headline: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};
    return this.prisma.mentorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  };

  upsertMentorProfile = async (userId: string, data: any) => {
    return this.prisma.mentorProfile.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });
  };

  requestMentorship = async (mentorId: string, menteeId: string, body: any) => {
    const req = await this.prisma.mentorshipRequest.create({
      data: { mentorId, menteeId, topic: body?.topic, message: body?.message },
    });
    return req;
  };

  listRequestsForMentor = async (userId: string) => {
    return this.prisma.mentorshipRequest.findMany({
      where: { mentorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  };

  setRequestStatus = async (id: string, status: string) => {
    return this.prisma.mentorshipRequest.update({
      where: { id },
      data: { status },
    });
  };
}
