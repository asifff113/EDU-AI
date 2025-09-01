import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('gamification')
@UseGuards(AuthGuard)
export class GamificationController {
  constructor(private readonly svc: GamificationService) {}

  @Get('me')
  async me(@Request() req: any) {
    return this.svc.getProfile(req.user.id);
  }

  @Post('add')
  async add(@Request() req: any, @Body() body: any) {
    return this.svc.addProgress({
      userId: req.user.id,
      xp: body?.xp ?? 0,
      points: body?.points ?? 0,
      reason: body?.reason,
    });
  }

  @Post('achievements/:code')
  async award(@Request() req: any, @Param('code') code: string) {
    return this.svc.awardAchievement(req.user.id, code);
  }

  @Get('achievements')
  async achievements(@Request() req: any) {
    return this.svc.getAchievements(req.user.id);
  }

  @Get('leaderboard')
  async leaderboard(
    @Query('type') type: 'xp' | 'points' = 'xp',
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 20;
    return this.svc.getLeaderboard(type, lim);
  }
}
