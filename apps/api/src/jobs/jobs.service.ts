import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsGateway } from './jobs.gateway';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private gateway: JobsGateway,
  ) {}

  private async ensureDefaultJobs() {
    const count = await this.prisma.job.count();
    if (count > 0) return;
    // Create some default companies and jobs so users see opportunities immediately
    const datahub = await this.prisma.company.upsert({
      where: { id: 'comp-datahub' },
      update: {},
      create: {
        id: 'comp-datahub',
        name: 'DataHub Ltd',
        website: 'https://datahub.example',
        description: 'Analytics and BI firm',
      },
    });
    const cloudnine = await this.prisma.company.upsert({
      where: { id: 'comp-cloudnine' },
      update: {},
      create: {
        id: 'comp-cloudnine',
        name: 'CloudNine',
        website: 'https://cloudnine.example',
        description: 'Cloud platform startup',
      },
    });
    const securify = await this.prisma.company.upsert({
      where: { id: 'comp-securify' },
      update: {},
      create: {
        id: 'comp-securify',
        name: 'Securify',
        website: 'https://securify.example',
        description: 'Cybersecurity services',
      },
    });
    await this.prisma.job.createMany({
      data: [
        {
          title: 'Data Analyst Intern',
          type: 'internship',
          location: 'Dhaka',
          remote: true,
          description: 'Assist BI team with dashboards.',
          requirements: 'SQL, Excel, basic Python',
          companyId: datahub.id,
          salaryMin: 10000,
          salaryMax: 15000,
          isOpen: true,
        },
        {
          title: 'Junior Data Scientist',
          type: 'full-time',
          location: 'Remote',
          remote: true,
          description: 'Work on ML models.',
          requirements: 'Python, Pandas, scikit-learn',
          companyId: datahub.id,
          salaryMin: 60000,
          salaryMax: 90000,
          isOpen: true,
        },
        {
          title: 'Cloud Engineer (Intern)',
          type: 'internship',
          location: 'Remote',
          remote: true,
          description: 'Support cloud ops.',
          requirements: 'Linux, Docker basics',
          companyId: cloudnine.id,
          salaryMin: 12000,
          salaryMax: 18000,
          isOpen: true,
        },
        {
          title: 'Cybersecurity Analyst',
          type: 'full-time',
          location: 'Dhaka',
          remote: false,
          description: 'Monitor and respond to security alerts.',
          requirements: 'SIEM, networking',
          companyId: securify.id,
          salaryMin: 70000,
          salaryMax: 110000,
          isOpen: true,
        },
      ],
      skipDuplicates: true,
    });
  }

  async list(params: { q?: string; type?: string }) {
    const { q, type } = params;
    await this.ensureDefaultJobs();
    return this.prisma.job.findMany({
      where: {
        isOpen: true,
        type: type || undefined,
        OR: q
          ? [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { company: { name: { contains: q, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createApplication(
    userId: string,
    jobId: string,
    coverLetter?: string,
    resumeId?: string,
  ) {
    const app = await this.prisma.application.create({
      data: { userId, jobId, coverLetter, resumeId: resumeId ?? null },
      include: { job: { include: { company: true } } },
    });
    try {
      this.gateway.server.emit('applications:update', {
        jobId,
        applicationId: app.id,
      });
    } catch {}
    return app;
  }

  async listApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertResume(userId: string, data: any) {
    return this.prisma.resume.upsert({
      where: { userId },
      update: { ...data },
      create: {
        userId,
        skills: [],
        shareToken: (
          Math.random().toString(36).slice(2) + Date.now().toString(36)
        ).toUpperCase(),
        ...data,
      },
    });
  }

  async postJob(userId: string, data: any) {
    // Ensure company exists or create owned one
    let companyId = data.companyId as string | undefined;
    if (!companyId && data.companyName) {
      const company = await this.prisma.company.create({
        data: {
          name: data.companyName,
          ownerId: userId,
          website: data.website ?? null,
        },
      });
      companyId = company.id;
    }
    if (!companyId) throw new Error('companyId or companyName is required');
    const job = await this.prisma.job.create({
      data: {
        title: data.title,
        type: data.type,
        location: data.location ?? null,
        remote: Boolean(data.remote ?? true),
        description: data.description ?? null,
        requirements: data.requirements ?? null,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        companyId,
      },
      include: { company: true },
    });
    try {
      this.gateway.server.emit('jobs:new', job);
    } catch {}
    return job;
  }

  async listApplicants(userId: string, jobId: string) {
    // Restrict to jobs owned by user's company
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });
    if (!job) throw new Error('Job not found');
    if (job.company.ownerId && job.company.ownerId !== userId)
      throw new Error('Not allowed');
    return this.prisma.application.findMany({
      where: { jobId },
      include: { user: true, resume: true },
    });
  }

  async setApplicationStatus(
    userId: string,
    applicationId: string,
    status: string,
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { include: { company: true } } },
    });
    if (!app) throw new Error('Application not found');
    if (app.job.company.ownerId && app.job.company.ownerId !== userId)
      throw new Error('Not allowed');
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
    try {
      this.gateway.server.emit('applications:update', {
        jobId: app.jobId,
        applicationId: updated.id,
        status,
      });
    } catch {}
    return updated;
  }

  async getResume(userId: string) {
    return this.prisma.resume.findUnique({ where: { userId } });
  }

  async getResumeByToken(token: string) {
    return this.prisma.resume.findFirst({ where: { shareToken: token } });
  }
}
