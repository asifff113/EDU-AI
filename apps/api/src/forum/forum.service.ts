import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  async listBoards() {
    return this.prisma.forumBoard.findMany({
      include: {
        _count: { select: { topics: true, moderators: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBoard(
    userId: string,
    data: { name: string; description?: string; isPublic?: boolean },
  ) {
    return this.prisma.forumBoard.create({
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic ?? true,
        createdById: userId,
      },
    });
  }

  async listTopics(boardId: string) {
    return this.prisma.forumTopic.findMany({
      where: { boardId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: { select: { posts: true } },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createTopic(
    userId: string,
    boardId: string,
    title: string,
    tags: string[],
  ) {
    const board = await this.prisma.forumBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('Board not found');
    return this.prisma.forumTopic.create({
      data: { boardId, title, authorId: userId, tags },
    });
  }

  async listPosts(topicId: string) {
    return this.prisma.forumPost.findMany({
      where: { topicId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: [{ accepted: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async addPost(userId: string, topicId: string, content: string) {
    const topic = await this.prisma.forumTopic.findUnique({
      where: { id: topicId },
      include: { board: true },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    // check if user is expert moderator for isExpert flag
    const mod = await this.prisma.forumModerator.findFirst({
      where: { boardId: topic.boardId, userId },
    });
    const created = await this.prisma.forumPost.create({
      data: {
        topicId,
        authorId: userId,
        content,
        isExpert: !!mod && (mod.role === 'expert' || mod.role === 'moderator'),
      },
    });
    const mentionMatches = content.match(/@\w+/g) || [];
    for (const mention of mentionMatches) {
      const username = mention.slice(1);
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ username }, { email: username }] },
        select: { id: true },
      });
      if (user) {
        await this.prisma.forumNotification.create({
          data: {
            userId: user.id,
            type: 'mention',
            topicId,
            postId: created.id,
          },
        });
      }
    }
    return created;
  }

  async editPost(userId: string, postId: string, content: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { topic: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const isOwner = post.authorId === userId;
    const isMod = await this.prisma.forumModerator.findFirst({
      where: { boardId: post.topic.boardId, userId },
    });
    if (!isOwner && !isMod) throw new ForbiddenException('Not allowed');
    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { content, editedAt: new Date(), editedById: userId },
    });
  }

  async softDeletePost(userId: string, postId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { topic: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const isOwner = post.authorId === userId;
    const isMod = await this.prisma.forumModerator.findFirst({
      where: { boardId: post.topic.boardId, userId },
    });
    if (!isOwner && !isMod) throw new ForbiddenException('Not allowed');
    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }

  async setAccepted(
    userId: string,
    topicId: string,
    postId: string,
    accepted: boolean,
  ) {
    const topic = await this.prisma.forumTopic.findUnique({
      where: { id: topicId },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    if (topic.authorId !== userId)
      throw new ForbiddenException('Only topic author can accept answers');
    await this.prisma.forumPost.updateMany({
      where: { topicId },
      data: { accepted: false },
    });
    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { accepted },
    });
  }

  async togglePin(userId: string, topicId: string, pinned: boolean) {
    // Allow board moderator/expert to pin
    const topic = await this.prisma.forumTopic.findUnique({
      where: { id: topicId },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    const mod = await this.prisma.forumModerator.findFirst({
      where: { boardId: topic.boardId, userId },
    });
    if (!mod) throw new ForbiddenException('Only moderators can pin');
    return this.prisma.forumTopic.update({
      where: { id: topicId },
      data: { pinned },
    });
  }

  async toggleLock(userId: string, topicId: string, locked: boolean) {
    const topic = await this.prisma.forumTopic.findUnique({
      where: { id: topicId },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    const mod = await this.prisma.forumModerator.findFirst({
      where: { boardId: topic.boardId, userId },
    });
    if (!mod) throw new ForbiddenException('Only moderators can lock');
    return this.prisma.forumTopic.update({
      where: { id: topicId },
      data: { locked },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { topic: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const isOwner = post.authorId === userId;
    const isMod = await this.prisma.forumModerator.findFirst({
      where: { boardId: post.topic.boardId, userId },
    });
    if (!isOwner && !isMod) throw new ForbiddenException('Not allowed');
    return this.prisma.forumPost.delete({ where: { id: postId } });
  }

  async subscribe(
    userId: string,
    opts: { boardId?: string; topicId?: string; emailDigest?: boolean },
  ) {
    return this.prisma.forumSubscription.create({
      data: {
        userId,
        boardId: opts.boardId,
        topicId: opts.topicId,
        emailDigest: !!opts.emailDigest,
      },
    });
  }

  async search(
    boardId: string,
    q: { text?: string; tag?: string; authorId?: string },
  ) {
    return this.prisma.forumTopic.findMany({
      where: {
        boardId,
        title: q.text ? { contains: q.text, mode: 'insensitive' } : undefined,
        tags: q.tag ? { has: q.tag } : undefined,
        authorId: q.authorId || undefined,
      },
      include: { _count: { select: { posts: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
