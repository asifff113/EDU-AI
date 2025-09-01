import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('wellness')
@UseGuards(AuthGuard)
export class WellnessController {
  constructor(private svc: WellnessService) {}

  @Post('study-log')
  async log(@Request() req: any, @Body() body: any) {
    return this.svc.logStudy(req.user.id, body);
  }

  @Get('logs')
  async logs(@Request() req: any) {
    return this.svc.listLogs(req.user.id);
  }

  @Get('mindfulness')
  async mindfulness() {
    return this.svc.listMindfulness();
  }

  @Get('slots')
  async slots() {
    return this.svc.listCounselorSlots();
  }

  @Post('slots/:id/book')
  async book(@Param('id') id: string, @Request() req: any) {
    return this.svc.bookSlot(id, req.user.id);
  }
}
