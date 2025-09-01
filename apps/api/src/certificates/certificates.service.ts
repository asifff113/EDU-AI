import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  private async ensureDefaultTemplates() {
    const count = await this.prisma.certificateTemplate.count();
    if (count > 0) return;
    const templates = [
      {
        id: 'tpl-completion',
        name: 'Course Completion',
        description: 'Awarded upon completing a course',
        kind: 'completion',
        isPaid: false,
        bgUrl: '/uploads/certificates/completion-bg.png',
        category: 'General',
      },
      {
        id: 'tpl-verified',
        name: 'Verified Credential',
        description: 'Identity and skill verified',
        kind: 'verified',
        isPaid: true,
        price: 9.99,
        bgUrl: '/uploads/certificates/verified-bg.png',
        category: 'General',
      },
      {
        id: 'tpl-chain',
        name: 'Blockchain Record',
        description: 'Immutable on-chain proof of achievement',
        kind: 'blockchain',
        isPaid: true,
        price: 4.99,
        bgUrl: '/uploads/certificates/blockchain-bg.png',
        category: 'General',
      },
      {
        id: 'tpl-career-data-analyst',
        name: 'Data Analyst',
        description: 'Prove analyst skills',
        kind: 'verified',
        isPaid: false,
        requiresExam: true,
        examCategory: 'data',
        minPercentage: 60,
        category: 'Career',
      },
      {
        id: 'tpl-career-data-scientist',
        name: 'Data Scientist',
        description: 'Prove DS skills',
        kind: 'verified',
        isPaid: true,
        price: 4.99,
        requiresExam: true,
        examCategory: 'data',
        minPercentage: 65,
        category: 'Career',
      },
      {
        id: 'tpl-career-data-engineer',
        name: 'Data Engineer',
        description: 'Prove DE skills',
        kind: 'verified',
        isPaid: true,
        price: 4.99,
        requiresExam: true,
        examCategory: 'data',
        minPercentage: 60,
        category: 'Career',
      },
      {
        id: 'tpl-ai-eng-dev',
        name: 'AI Engineer for Developers',
        description: 'Foundational AI engineer skills',
        kind: 'verified',
        isPaid: true,
        price: 5.99,
        requiresExam: true,
        examCategory: 'programming',
        minPercentage: 70,
        category: 'Career',
      },
      {
        id: 'tpl-ai-eng-ds',
        name: 'AI Engineer for Data Scientists',
        description: 'AI engineering with DS background',
        kind: 'verified',
        isPaid: true,
        price: 5.99,
        requiresExam: true,
        examCategory: 'data',
        minPercentage: 70,
        category: 'Career',
      },
      {
        id: 'tpl-english-exam',
        name: 'English Proficiency',
        description: 'Pass English proficiency exam',
        kind: 'verified',
        isPaid: false,
        requiresExam: true,
        examCategory: 'language',
        minPercentage: 55,
        category: 'Language',
      },
      {
        id: 'tpl-math-aptitude',
        name: 'Mathematics Aptitude',
        description: 'Pass Mathematics exam',
        kind: 'verified',
        isPaid: false,
        requiresExam: true,
        examCategory: 'mathematics',
        minPercentage: 60,
        category: 'Mathematics',
      },
      {
        id: 'tpl-cloud-fundamentals',
        name: 'Cloud Practitioner',
        description: 'Cloud fundamentals credential',
        kind: 'verified',
        isPaid: true,
        price: 3.99,
        requiresExam: true,
        examCategory: 'cloud',
        minPercentage: 60,
        category: 'Cloud',
      },
      {
        id: 'tpl-cybersec-basics',
        name: 'Cybersecurity Fundamentals',
        description: 'Security basics credential',
        kind: 'verified',
        isPaid: true,
        price: 3.99,
        requiresExam: true,
        examCategory: 'security',
        minPercentage: 60,
        category: 'Security',
      },
    ];
    await this.prisma.certificateTemplate.createMany({
      data: templates as any,
      skipDuplicates: true,
    });
  }

  async listTemplates() {
    await this.ensureDefaultTemplates();
    return this.prisma.certificateTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMine(userId: string) {
    const list = await this.prisma.certificate.findMany({
      where: { userId },
      include: { template: true },
      orderBy: { issuedAt: 'desc' },
    });
    if (list.length > 0) return list;

    // If user is the requested email and has none, issue two sample certificates
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.email === 'howeverok45@gmail.com') {
      await this.ensureDefaultTemplates();
      const completion = await this.prisma.certificateTemplate.findUnique({
        where: { id: 'tpl-completion' },
      });
      const verified = await this.prisma.certificateTemplate.findUnique({
        where: { id: 'tpl-verified' },
      });
      if (completion) {
        await this.issue({
          templateId: completion.id,
          userId,
          title: 'Welcome — Completion',
        });
      }
      if (verified) {
        await this.issue({
          templateId: verified.id,
          userId,
          title: 'Verified Credential',
        });
      }
      return this.prisma.certificate.findMany({
        where: { userId },
        include: { template: true },
        orderBy: { issuedAt: 'desc' },
      });
    }
    return list;
  }

  async getById(id: string, userId: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!cert || cert.userId !== userId)
      throw new NotFoundException('Certificate not found');
    return cert;
  }

  async verify(code: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: { verificationCode: code },
      include: { template: true, user: true },
    });
    if (!cert) throw new NotFoundException('Invalid verification code');
    return cert;
  }

  private generateSerial(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = randomBytes(4).toString('hex').toUpperCase();
    return `EDU-${ts}-${rnd}`;
  }

  private generateCode(): string {
    return randomBytes(6).toString('hex');
  }

  async issue(params: {
    templateId: string;
    userId: string;
    title?: string;
    courseId?: string | null;
    metadata?: any;
  }) {
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id: params.templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    // Enforce exam gating if configured
    if (template.requiresExam && template.examCategory) {
      const attempt = await this.prisma.examAttempt.findFirst({
        where: {
          userId: params.userId,
          status: 'completed',
          exam: { category: template.examCategory },
        },
        orderBy: { createdAt: 'desc' },
      });
      const passed =
        attempt?.passed &&
        (template.minPercentage == null ||
          (attempt?.percentage ?? 0) >= template.minPercentage);
      if (!passed) {
        throw new Error(
          `Requires passing a ${template.examCategory} exam` +
            (template.minPercentage
              ? ` with >= ${template.minPercentage}%`
              : ''),
        );
      }
    }

    // If template is paid, check subscription to waive or discount payment (record price in metadata)
    let pricePaid: number | undefined = undefined;
    if (template.isPaid && template.price) {
      pricePaid = template.price;
      const activeSub = await this.prisma.subscription.findFirst({
        where: { userId: params.userId, status: 'active' },
        include: { plan: true },
      });
      if (activeSub?.plan) {
        if (activeSub.plan.interval === 'yearly') {
          pricePaid = 0;
        } else if (activeSub.plan.interval === 'monthly') {
          pricePaid = Math.max(0, pricePaid * 0.5);
        } else if (activeSub.plan.interval === 'family') {
          pricePaid = Math.max(0, pricePaid * 0.25);
        }
      }
    }

    const cert = await this.prisma.certificate.create({
      data: {
        userId: params.userId,
        templateId: params.templateId,
        courseId: params.courseId ?? null,
        title: params.title ?? template.name,
        serial: this.generateSerial(),
        verificationCode: this.generateCode(),
        metadata: { ...(params.metadata ?? {}), pricePaid },
      },
      include: { template: true },
    });

    return cert;
  }
}
