import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthGuard } from '../auth/auth.guard';
import { Param } from '@nestjs/common';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  async list(@Query('q') q?: string, @Query('type') type?: string) {
    return this.jobs.list({ q, type });
  }

  @Post('post')
  @UseGuards(AuthGuard)
  async postJob(@Request() req: any, @Body() body: any) {
    return this.jobs.postJob(req.user.id, body);
  }

  @Post('applicants')
  @UseGuards(AuthGuard)
  async applicants(@Request() req: any, @Body() body: { jobId: string }) {
    return this.jobs.listApplicants(req.user.id, body.jobId);
  }

  @Post('set-status')
  @UseGuards(AuthGuard)
  async setStatus(
    @Request() req: any,
    @Body() body: { applicationId: string; status: string },
  ) {
    return this.jobs.setApplicationStatus(
      req.user.id,
      body.applicationId,
      body.status,
    );
  }

  @Get('/company/:id')
  async company(@Param('id') id: string) {
    // Inline aggregation of company with jobs
    return (this as any).jobs['prisma'].company.findUnique({
      where: { id },
      include: { jobs: true },
    });
  }

  @Get('applications')
  @UseGuards(AuthGuard)
  async myApplications(@Request() req: any) {
    return this.jobs.listApplications(req.user.id);
  }

  @Post('apply')
  @UseGuards(AuthGuard)
  async apply(
    @Request() req: any,
    @Body() body: { jobId: string; coverLetter?: string; resumeId?: string },
  ) {
    return this.jobs.createApplication(
      req.user.id,
      body.jobId,
      body.coverLetter,
      body.resumeId,
    );
  }

  @Post('resume')
  @UseGuards(AuthGuard)
  async upsertResume(@Request() req: any, @Body() body: any) {
    return this.jobs.upsertResume(req.user.id, body);
  }

  @Get('resume/me')
  @UseGuards(AuthGuard)
  async myResume(@Request() req: any) {
    return this.jobs.getResume(req.user.id);
  }

  @Get('resume/share/:token')
  async sharedResume(@Param('token') token: string) {
    return this.jobs.getResumeByToken(token);
  }
}
