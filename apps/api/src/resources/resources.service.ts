import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async getAllResources(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    sortBy?: string;
  }) {
    const where: any = {
      isActive: true,
    };

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters?.type && filters.type !== 'all') {
      where.type = filters.type;
    }

    if (filters?.level && filters.level !== 'all') {
      where.level = filters.level;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search.toLowerCase() } },
      ];
    }

    let orderBy: any = { downloads: 'desc' }; // Default to popular

    switch (filters?.sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'recent':
        orderBy = { uploadDate: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      default:
        orderBy = { downloads: 'desc' };
    }

    const resources = await this.prisma.resource.findMany({
      where,
      orderBy,
      include: {
        contributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    return resources.map((resource) => ({
      ...resource,
      contributorName: resource.contributor.firstName
        ? `${resource.contributor.firstName} ${resource.contributor.lastName}`
        : resource.contributor.username,
    }));
  }

  async ensureDemoStoreItems() {
    const count = await this.prisma.resource.count();
    if (count > 0) return;
    let contributor = await this.prisma.user.findFirst();
    if (!contributor) {
      contributor = await this.prisma.user.create({
        data: {
          email: 'store-demo@eduai.local',
          password: 'demo',
          role: 'teacher',
          firstName: 'Store',
          lastName: 'Demo',
          isProfilePublic: true,
        },
      });
    }
    const contributorId = contributor.id;
    const demoItems = [
      {
        title: 'High-Yield Calculus Notes (Exam Ready)',
        description:
          'Concise calculus notes with solved examples and exam tips.',
        type: 'notes',
        category: 'mathematics',
        subject: 'Calculus',
        level: 'intermediate',
        format: 'pdf',
        fileUrl: '/uploads/resources/demo-calculus.pdf',
        author: 'EDU AI',
        contributorId,
        tags: ['calculus', 'notes', 'exam'],
        isFree: false,
        price: 2.99,
      },
      {
        title: 'Physics Formula Cheatsheet',
        description: 'A one-page PDF of essential formulas for quick revision.',
        type: 'notes',
        category: 'science',
        subject: 'Physics',
        level: 'beginner',
        format: 'pdf',
        fileUrl: '/uploads/resources/demo-physics.pdf',
        author: 'EDU AI',
        contributorId,
        tags: ['physics', 'cheatsheet'],
        isFree: true,
        price: null,
      },
      {
        title: 'Intro to Machine Learning (eBook)',
        description: 'A starter eBook for ML fundamentals with code snippets.',
        type: 'book',
        category: 'programming',
        subject: 'Machine Learning',
        level: 'intermediate',
        format: 'pdf',
        fileUrl: '/uploads/resources/demo-ml.pdf',
        author: 'EDU AI',
        contributorId,
        tags: ['ml', 'ebook'],
        isFree: false,
        price: 4.99,
      },
    ];
    for (const item of demoItems) {
      try {
        await this.prisma.resource.create({ data: item as any });
      } catch {}
    }
  }

  async getResourceById(id: string, userId?: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        contributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        reviews: {
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Check if user has favorited this resource
    let isFavorited = false;
    if (userId) {
      const favorite = await this.prisma.resourceFavorite.findUnique({
        where: {
          resourceId_userId: {
            resourceId: id,
            userId,
          },
        },
      });
      isFavorited = !!favorite;
    }

    return {
      ...resource,
      contributorName: resource.contributor.firstName
        ? `${resource.contributor.firstName} ${resource.contributor.lastName}`
        : resource.contributor.username,
      isFavorited,
    };
  }

  async createResource(data: any, contributorId: string) {
    const resource = await this.prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        subject: data.subject,
        level: data.level,
        format: data.format,
        fileUrl: data.fileUrl,
        externalUrl: data.externalUrl,
        fileSize: data.fileSize,
        duration: data.duration,
        author: data.author,
        contributorId,
        tags: data.tags || [],
        isFree: data.isFree ?? true,
        price: data.price,
        thumbnail: data.thumbnail,
      },
      include: {
        contributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return {
      ...resource,
      contributorName: resource.contributor.firstName
        ? `${resource.contributor.firstName} ${resource.contributor.lastName}`
        : resource.contributor.username,
    };
  }

  async updateResource(id: string, data: any, userId: string) {
    // Check if user owns the resource or is admin
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: { contributor: true },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.contributorId !== userId) {
      // Check if user is admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized to update this resource');
      }
    }

    const updatedResource = await this.prisma.resource.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        subject: data.subject,
        level: data.level,
        author: data.author,
        tags: data.tags,
        isFree: data.isFree,
        price: data.price,
        isVerified: data.isVerified,
      },
      include: {
        contributor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return {
      ...updatedResource,
      contributorName: updatedResource.contributor.firstName
        ? `${updatedResource.contributor.firstName} ${updatedResource.contributor.lastName}`
        : updatedResource.contributor.username,
    };
  }

  async deleteResource(id: string, userId: string) {
    // Check if user owns the resource or is admin
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.contributorId !== userId) {
      // Check if user is admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized to delete this resource');
      }
    }

    await this.prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Resource deleted successfully' };
  }

  async incrementDownloads(id: string) {
    await this.prisma.resource.update({
      where: { id },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });
  }

  async incrementViews(id: string) {
    await this.prisma.resource.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  async purchase(resourceId: string, buyerId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource) throw new Error('Resource not found');
    if (resource.isFree) throw new Error('This resource is free to download');
    if (!resource.price || resource.price <= 0)
      throw new Error('Invalid price');
    // Prevent duplicate purchases
    const existing = await this.prisma.purchase.findUnique({
      where: { resourceId_buyerId: { resourceId, buyerId } },
    });
    if (existing) return existing;
    // Apply subscription perks
    let pricePaid = resource.price || 0;
    const activeSub = await this.prisma.subscription.findFirst({
      where: { userId: buyerId, status: 'active' },
      include: { plan: true },
    });
    if (activeSub?.plan) {
      if (activeSub.plan.interval === 'yearly') {
        pricePaid = 0; // annual: free
      } else if (activeSub.plan.interval === 'monthly') {
        pricePaid = Math.max(0, pricePaid * 0.5); // monthly: 50% off
      } else if (activeSub.plan.interval === 'family') {
        pricePaid = Math.max(0, pricePaid * 0.25); // family: 75% off
      }
    }
    const purchase = await this.prisma.purchase.create({
      data: { resourceId, buyerId, pricePaid },
    });
    return purchase;
  }

  async toggleFavorite(resourceId: string, userId: string) {
    const existing = await this.prisma.resourceFavorite.findUnique({
      where: {
        resourceId_userId: {
          resourceId,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.resourceFavorite.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false };
    } else {
      await this.prisma.resourceFavorite.create({
        data: {
          resourceId,
          userId,
        },
      });
      return { isFavorited: true };
    }
  }

  async addReview(
    resourceId: string,
    userId: string,
    rating: number,
    comment?: string,
  ) {
    // Check if user already reviewed
    const existing = await this.prisma.resourceReview.findUnique({
      where: {
        resourceId_userId: {
          resourceId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error('You have already reviewed this resource');
    }

    const review = await this.prisma.resourceReview.create({
      data: {
        resourceId,
        userId,
        rating,
        comment,
      },
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
    });

    // Update resource rating
    const reviews = await this.prisma.resourceReview.findMany({
      where: { resourceId },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.prisma.resource.update({
      where: { id: resourceId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    return review;
  }

  async getUserResources(userId: string) {
    return this.prisma.resource.findMany({
      where: {
        contributorId: userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.resourceFavorite.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            contributor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                favorites: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => ({
      ...fav.resource,
      contributorName: fav.resource.contributor.firstName
        ? `${fav.resource.contributor.firstName} ${fav.resource.contributor.lastName}`
        : fav.resource.contributor.username,
    }));
  }
}
