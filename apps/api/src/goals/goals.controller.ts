import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('goals')
@UseGuards(AuthGuard)
export class GoalsController {
  constructor(private readonly svc: GoalsService) {}

  @Get()
  async list(@Request() req: any) {
    return this.svc.list(req.user.id);
  }

  @Get('streak')
  async streak(@Request() req: any) {
    return this.svc.streak(req.user.id);
  }

  @Post('upsert')
  async upsert(@Request() req: any, @Body() body: any) {
    return this.svc.upsertGoal(req.user.id, body);
  }

  @Post('log')
  async log(@Request() req: any, @Body() body: any) {
    return this.svc.logProgress(req.user.id, body);
  }
}
