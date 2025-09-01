import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const settings = await this.settingsService.getUserSettings(userId);
      return settings;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to fetch settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  async updateSettings(
    @Request() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const settings = await this.settingsService.updateUserSettings(
        userId,
        body,
      );
      return settings;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to update settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!body.currentPassword || !body.newPassword) {
        throw new HttpException(
          'Current password and new password are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.settingsService.changePassword(
        userId,
        body.currentPassword,
        body.newPassword,
      );
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to change password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('export')
  async exportData(@Request() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.settingsService.exportUserData(userId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="eduai-data-${new Date().toISOString().split('T')[0]}.json"`,
      );

      return res.json(data);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to export data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-account')
  async deleteAccount(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.settingsService.deleteUserAccount(userId);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to delete account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
