import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    try {
      return await this.authService.register(body);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      return await this.authService.forgotPassword(body.email);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to send reset code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    try {
      return await this.authService.verifyResetCode(body.email, body.code);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Invalid code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; password: string },
  ) {
    try {
      return await this.authService.resetPassword(
        body.email,
        body.code,
        body.password,
      );
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to reset password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Debug log: do not log passwords
      console.log(`[auth] login attempt for email=${body?.email}`);
      const token = await this.authService.login(body.email, body.password);
      // Set cookie (httpOnly, secure in production)
      res.cookie('eduai_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
      return { message: 'Logged in' };
    } catch (error) {
      console.error('[auth] login error', JSON.stringify(error));
      const err = error as Error;
      throw new HttpException(
        err.message || 'Login failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the auth cookie with all necessary options
    res.clearCookie('eduai_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    try {
      const token = req.cookies?.eduai_token;
      if (!token) {
        throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.getUserFromToken(token);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        err.message || 'Failed to get user info',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
