import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('mentorship')
@UseGuards(AuthGuard)
export class MentorshipController {
  constructor(private svc: MentorshipService) {}

  @Get('mentors')
  async mentors(@Query('q') q?: string) {
    return this.svc.listMentors(q);
  }

  @Put('profile')
  async upsertProfile(@Request() req: any, @Body() body: any) {
    return this.svc.upsertMentorProfile(req.user.id, body);
  }

  @Post('request/:mentorId')
  async request(
    @Request() req: any,
    @Param('mentorId') mentorId: string,
    @Body() body: any,
  ) {
    return this.svc.requestMentorship(mentorId, req.user.id, body);
  }

  @Get('requests')
  async myRequests(@Request() req: any) {
    return this.svc.listRequestsForMentor(req.user.id);
  }

  @Post('requests/:id/status')
  async setStatus(@Param('id') id: string, @Body() body: any) {
    return this.svc.setRequestStatus(id, body?.status);
  }
}
