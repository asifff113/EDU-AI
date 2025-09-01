import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.profileService.getProfile(userId);
  }

  @Put()
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.profileService.updateProfile(userId, updateProfileDto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.profileService.uploadAvatar(userId, file);
  }

  @Get('public')
  async getPublicProfiles() {
    return this.profileService.getPublicProfiles();
  }

  @Get('test')
  async testProfile() {
    // Return a test profile without authentication for debugging
    return {
      id: 'test-user',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'student',
      rating: 4.5,
      reviewCount: 10,
      joinedDate: new Date().toISOString(),
      isProfilePublic: true,
      message: 'This is a test profile endpoint without authentication',
    };
  }
}
