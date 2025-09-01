import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async register(data: any) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error('User with this email already exists');
    }
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        age: data.age ? Number(data.age) : null,
        phone: data.phone,
        nationality: data.nationality,
        role: data.role ? data.role.toLowerCase() : 'student',
      },
    });
    return {
      message: 'Registration successful',
      user: { id: user.id, email: user.email },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Hash the reset code before storing
    const hashedResetCode = await bcrypt.hash(resetCode, 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedResetCode,
        passwordResetExpires: resetExpires,
      },
    });

    // Send email with reset code
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Code - EDU AI',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your EDU AI account.</p>
        <p>Your reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return { message: 'Reset code sent to your email' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new Error('Invalid or expired reset code');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new Error('Reset code has expired');
    }

    const isValidCode = await bcrypt.compare(code, user.passwordResetToken);
    if (!isValidCode) {
      throw new Error('Invalid reset code');
    }

    return { message: 'Code verified successfully' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    // First verify the code
    await this.verifyResetCode(email, code);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
          age: true,
          phone: true,
          nationality: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
