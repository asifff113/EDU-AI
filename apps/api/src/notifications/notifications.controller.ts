import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  async list(@Request() req: any) {
    return this.svc.list(req.user.id);
  }

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    return this.svc.create(req.user.id, body);
  }

  @Post(':id/read')
  async read(@Request() req: any, @Param('id') id: string) {
    return this.svc.markRead(req.user.id, id);
  }

  @Post('read-all')
  async readAll(@Request() req: any) {
    return this.svc.markAllRead(req.user.id);
  }
}
