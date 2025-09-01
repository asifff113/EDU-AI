import {
  Controller,
  Get,
  Query,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGateway } from './admin.gateway';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly prisma: PrismaService,
    private readonly gateway: AdminGateway,
  ) {}

  @Get('stats')
  async getStats() {
    return this.admin.stats();
  }

  @Get('users')
  async listUsers(@Query('role') role?: string, @Query('q') q?: string) {
    const validRole =
      role && Object.values(Role).includes(role as Role)
        ? (role as Role)
        : undefined;
    return this.admin.listUsers({ role: validRole, search: q });
  }

  @Put('users/role')
  async setRole(
    @Body()
    body: {
      userId: string;
      role: 'admin' | 'teacher' | 'student' | 'qa_solver';
    },
  ) {
    const res = await this.admin.setUserRole(body.userId, body.role);
    this.gateway.emit('users:update', { userId: body.userId, role: body.role });
    return res;
  }

  // Settings
  @Get('settings')
  async getSettings() {
    const rows = await this.prisma.globalSetting.findMany();
    const settings: Record<string, any> = {};
    for (const r of rows) settings[r.key] = r.value as any;
    return settings;
  }

  @Put('settings')
  async setSettings(@Body() body: Record<string, any>) {
    const ops = Object.entries(body).map(([key, value]) =>
      this.prisma.globalSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );
    await Promise.all(ops);
    this.gateway.emit('settings:update', { keys: Object.keys(body) });
    return { ok: true };
  }

  // Courses & Resources lightweight moderation endpoints
  @Get('courses')
  async listCourses() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Put('courses/:id')
  async updateCourse(@Body() body: any) {
    const { id, ...data } = body;
    const updated = await this.prisma.course.update({ where: { id }, data });
    this.gateway.emit('courses:update', { id });
    return updated;
  }

  @Get('resources')
  async listResources() {
    return this.prisma.resource.findMany({
      orderBy: { uploadDate: 'desc' },
      take: 100,
    });
  }

  @Put('resources/:id')
  async updateResource(@Body() body: any) {
    const { id, ...data } = body;
    const updated = await this.prisma.resource.update({ where: { id }, data });
    this.gateway.emit('resources:update', { id });
    return updated;
  }
}
