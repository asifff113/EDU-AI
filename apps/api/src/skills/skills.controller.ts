import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('skills')
@UseGuards(AuthGuard)
export class SkillsController {
  constructor(private readonly svc: SkillsService) {}

  @Get('tree')
  async tree(@Request() req: any) {
    return this.svc.getTree(req.user.id);
  }

  @Post('complete')
  async complete(@Request() req: any, @Body() body: any) {
    return this.svc.completeMilestone(req.user.id, body.nodeId);
  }
}
