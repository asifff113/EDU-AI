import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ScholarshipsService } from './scholarships.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('scholarships')
@UseGuards(AuthGuard)
export class ScholarshipsController {
  constructor(private svc: ScholarshipsService) {}

  @Get('mine')
  async mine(@Request() req: any) {
    return this.svc.listMine(req.user.id);
  }

  @Post('award')
  async award(@Request() req: any, @Body() body: any) {
    // Allow self-award for development; in production gate by AdminGuard or rules
    return this.svc.award({ userId: req.user.id, ...body });
  }
}
