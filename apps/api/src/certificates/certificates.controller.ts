import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly svc: CertificatesService) {}

  @Get('templates')
  listTemplates() {
    return this.svc.listTemplates();
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  listMine(@Request() req: any) {
    return this.svc.listMine(req.user.id);
  }

  @Get('verify/:code')
  verify(@Param('code') code: string) {
    return this.svc.verify(code);
  }

  @Post('issue')
  @UseGuards(AuthGuard)
  issue(
    @Request() req: any,
    @Body()
    body: {
      templateId: string;
      userId?: string;
      title?: string;
      courseId?: string | null;
      metadata?: any;
    },
  ) {
    const targetUserId = body.userId ?? req.user.id;
    return this.svc.issue({
      templateId: body.templateId,
      userId: targetUserId,
      title: body.title,
      courseId: body.courseId,
      metadata: body.metadata,
    });
  }
}
