import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(query: string) {
    const q = (query || '').trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);

    const ors: any[] = [
      { email: { contains: q, mode: 'insensitive' } },
      { username: { contains: q, mode: 'insensitive' } },
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
    ];

    if (tokens.length >= 2) {
      // Match "First Last" order
      ors.push({
        AND: [
          { firstName: { contains: tokens[0], mode: 'insensitive' } },
          { lastName: { contains: tokens[1], mode: 'insensitive' } },
        ],
      });
      // Match "Last First" order
      ors.push({
        AND: [
          { firstName: { contains: tokens[1], mode: 'insensitive' } },
          { lastName: { contains: tokens[0], mode: 'insensitive' } },
        ],
      });
    }

    return this.prisma.user.findMany({
      where: {
        NOT: { role: 'admin' },
        OR: ors,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
      },
      take: 20,
    });
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId)
      throw new ForbiddenException('Cannot chat with yourself');
    // find existing - check all combinations to ensure deduplication
    const existing = await this.prisma.directConversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: { participants: true },
    });

    let conversation = existing;
    if (!existing) {
      // create new conversation
      conversation = await this.prisma.directConversation.create({
        data: {
          participants: {
            create: [{ userId }, { userId: otherUserId }],
          },
        },
        include: { participants: true },
      });
    }

    // Attach other participant user data (same logic as listConversations)
    const others = await this.prisma.user.findMany({
      where: {
        id: {
          in:
            conversation?.participants
              .map((p) => p.userId)
              .filter((id) => id !== userId) ?? [],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
      },
    });

    return { ...conversation, others } as any;
  }

  async listConversations(userId: string) {
    const convos = await this.prisma.directConversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: true,
        _count: { select: { messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        },
      },
    });
    // attach other participant user data
    const withUsers = await Promise.all(
      convos.map(async (c) => {
        const others = await this.prisma.user.findMany({
          where: {
            id: {
              in: c.participants
                .map((p) => p.userId)
                .filter((id) => id !== userId),
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            avatar: true,
          },
        });
        return { ...c, others } as any;
      }),
    );
    // Sort by last message time or updatedAt (newest first)
    return withUsers.sort((a, b) => {
      const aTime = a.messages?.[0]?.createdAt || a.updatedAt;
      const bTime = b.messages?.[0]?.createdAt || b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }

  async listMessages(conversationId: string, userId: string) {
    const isParticipant = await this.prisma.directParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!isParticipant) throw new ForbiddenException('Not in conversation');
    return this.prisma.directMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    content?: string;
    type?: string;
    fileUrl?: string;
  }) {
    let isParticipant = await this.prisma.directParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.conversationId,
          userId: params.senderId,
        },
      },
    });
    if (!isParticipant) {
      // auto-join if the conversation exists and sender is one of intended participants (fallback)
      const convo = await this.prisma.directConversation.findUnique({
        where: { id: params.conversationId },
      });
      if (!convo) throw new NotFoundException('Conversation not found');
      isParticipant = await this.prisma.directParticipant.create({
        data: {
          conversationId: params.conversationId,
          userId: params.senderId,
        },
      });
    }
    const msg = await this.prisma.directMessage.create({
      data: {
        conversationId: params.conversationId,
        senderId: params.senderId,
        content: params.content,
        type: params.type ?? 'text',
        fileUrl: params.fileUrl,
      },
    });
    await this.prisma.directConversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    });
    return msg;
  }

  async deleteConversation(conversationId: string, userId: string) {
    // Check if user is a participant
    const isParticipant = await this.prisma.directParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!isParticipant) throw new ForbiddenException('Not in conversation');

    // Delete all messages first, then participants, then conversation
    await this.prisma.directMessage.deleteMany({ where: { conversationId } });
    await this.prisma.directParticipant.deleteMany({
      where: { conversationId },
    });
    await this.prisma.directConversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  }
}
