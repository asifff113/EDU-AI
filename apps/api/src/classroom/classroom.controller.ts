import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('classrooms')
@UseGuards(AuthGuard)
export class ClassroomController {
  constructor(private readonly svc: ClassroomService) {}

  @Get()
  async list(@Request() req: any) {
    return this.svc.list(req.user.id);
  }

  @Post()
  async create(
    @Request() req: any,
    @Body() body: { title: string; description?: string; isPublic?: boolean },
  ) {
    return this.svc.createClassroom(req.user.id, body);
  }

  @Post(':id/join')
  async join(@Request() req: any, @Param('id') id: string) {
    return this.svc.join(id, req.user.id);
  }

  @Post(':id/breakouts')
  async createBreakout(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    return this.svc.createBreakout(id, req.user.id, body.name);
  }

  @Get(':id/breakouts')
  async listBreakouts(@Param('id') id: string) {
    return this.svc.listBreakouts(id);
  }

  @Post('breakouts/:breakoutId/join')
  async joinBreakout(
    @Request() req: any,
    @Param('breakoutId') breakoutId: string,
  ) {
    return this.svc.joinBreakout(breakoutId, req.user.id);
  }

  @Post('breakouts/:breakoutId/delete')
  async deleteBreakout(@Param('breakoutId') breakoutId: string) {
    // simple delete breakout; in production add host/cohost guard
    await this.svc.deleteBreakout(breakoutId);
    return { ok: true };
  }

  @Get(':id/participants')
  async participants(@Param('id') id: string) {
    return this.svc.listParticipants(id);
  }

  @Post(':id/role')
  async setRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { userId: string; role: 'host' | 'cohost' | 'member' },
  ) {
    return this.svc.setRole(id, req.user.id, body.userId, body.role);
  }

  @Post(':id/kick')
  async kick(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    return this.svc.kick(id, req.user.id, body.userId);
  }
}
