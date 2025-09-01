import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        bio: true,
        location: true,
        dateOfBirth: true,
        avatar: true,
        role: true,
        studyLevel: true,
        interests: true,
        coursesCompleted: true,
        subjects: true,
        hourlyRate: true,
        experience: true,
        qualifications: true,
        expertise: true,
        solvedQuestions: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        isProfilePublic: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      joinedDate: user.createdAt,
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone,
        bio: updateData.bio,
        location: updateData.location,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : null,
        role: updateData.role,
        studyLevel: updateData.studyLevel,
        interests: updateData.interests,
        subjects: updateData.subjects,
        hourlyRate: updateData.hourlyRate,
        experience: updateData.experience,
        qualifications: updateData.qualifications,
        expertise: updateData.expertise,
        isProfilePublic: updateData.isProfilePublic,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        bio: true,
        location: true,
        dateOfBirth: true,
        avatar: true,
        role: true,
        studyLevel: true,
        interests: true,
        coursesCompleted: true,
        subjects: true,
        hourlyRate: true,
        experience: true,
        qualifications: true,
        expertise: true,
        solvedQuestions: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        isProfilePublic: true,
      },
    });

    return {
      ...updatedUser,
      joinedDate: updatedUser.createdAt,
    };
  }

  async uploadAvatar(userId: string, file: any) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Update user avatar in database
    const avatarUrl = `/uploads/avatars/${fileName}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return { avatarUrl };
  }

  async getPublicProfiles() {
    const profiles = await this.prisma.user.findMany({
      where: {
        isProfilePublic: true,
        role: {
          not: 'admin',
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        location: true,
        avatar: true,
        role: true,
        studyLevel: true,
        interests: true,
        subjects: true,
        hourlyRate: true,
        experience: true,
        qualifications: true,
        expertise: true,
        solvedQuestions: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
      },
    });

    return profiles.map((profile) => ({
      ...profile,
      joinedDate: profile.createdAt,
      isOnline: Math.random() > 0.5, // Mock online status
    }));
  }
}
