import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private svc: SubscriptionsService) {}

  @Get('plans')
  async plans() {
    return this.svc.listPlans();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Request() req: any) {
    return this.svc.mySubscription(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Request() req: any, @Body() body: any) {
    return this.svc.subscribe(req.user.id, body.planId);
  }
}
