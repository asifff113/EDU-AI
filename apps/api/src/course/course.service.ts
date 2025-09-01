import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateCourseInput = {
  title: string;
  description?: string;
  details?: string;
  price?: number;
  seats?: number;
  category?: string;
  level?: string;
  isPublic?: boolean;
  createdById?: string | null;
  thumbnail?: string | null;
  contents?: Array<{
    type: string;
    title?: string;
    description?: string;
    fileUrl?: string | null;
    textContent?: string | null;
    duration?: string | null;
    size?: string | null;
    order?: number | null;
  }>;
};

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(input: CreateCourseInput) {
    const {
      title,
      description,
      details,
      price,
      seats,
      category,
      level,
      isPublic = true,
      createdById,
      thumbnail,
      contents = [],
    } = input;

    const created = await this.prisma.course.create({
      data: {
        title,
        description,
        details,
        price,
        seats,
        category,
        level,
        isPublic,
        createdById: createdById ?? undefined,
        thumbnail: thumbnail ?? undefined,
        contents: contents.length
          ? {
              create: contents.map((c) => ({
                type: c.type,
                title: c.title,
                description: c.description,
                fileUrl: c.fileUrl ?? undefined,
                textContent: c.textContent ?? undefined,
                duration: c.duration ?? undefined,
                size: c.size ?? undefined,
                order: c.order ?? undefined,
              })),
            }
          : undefined,
      },
      include: { contents: true },
    });
    return created;
  }

  async listCourses() {
    return this.prisma.course.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { contents: true },
    });
  }
}
