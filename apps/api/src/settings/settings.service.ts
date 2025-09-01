import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          // All default values are set in the schema
        },
      });
    }

    return settings;
  }

  async updateUserSettings(userId: string, data: any) {
    // First ensure settings exist
    await this.getUserSettings(userId);

    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        // Account Settings
        twoFactorEnabled: data.twoFactorEnabled,
        emailVerified: data.emailVerified,
        phoneVerified: data.phoneVerified,

        // Notification Settings
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        smsNotifications: data.smsNotifications,
        marketingEmails: data.marketingEmails,
        courseUpdates: data.courseUpdates,
        messageNotifications: data.messageNotifications,

        // Privacy Settings
        profileVisibility: data.profileVisibility,
        showOnlineStatus: data.showOnlineStatus,
        allowDirectMessages: data.allowDirectMessages,
        showEmail: data.showEmail,
        showPhone: data.showPhone,
        dataCollection: data.dataCollection,

        // Appearance Settings
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,

        // Learning Settings
        studyReminders: data.studyReminders,
        studyReminderTime: data.studyReminderTime,
        difficultyLevel: data.difficultyLevel,
        autoplay: data.autoplay,
        subtitles: data.subtitles,
        playbackSpeed: data.playbackSpeed,

        // Communication Settings
        allowVideoCall: data.allowVideoCall,
        allowVoiceCall: data.allowVoiceCall,
        allowScreenShare: data.allowScreenShare,
        defaultMeetingDuration: data.defaultMeetingDuration,
      },
      create: {
        userId,
        // Include all the same fields for create
        twoFactorEnabled: data.twoFactorEnabled,
        emailVerified: data.emailVerified,
        phoneVerified: data.phoneVerified,
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        smsNotifications: data.smsNotifications,
        marketingEmails: data.marketingEmails,
        courseUpdates: data.courseUpdates,
        messageNotifications: data.messageNotifications,
        profileVisibility: data.profileVisibility,
        showOnlineStatus: data.showOnlineStatus,
        allowDirectMessages: data.allowDirectMessages,
        showEmail: data.showEmail,
        showPhone: data.showPhone,
        dataCollection: data.dataCollection,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,
        studyReminders: data.studyReminders,
        studyReminderTime: data.studyReminderTime,
        difficultyLevel: data.difficultyLevel,
        autoplay: data.autoplay,
        subtitles: data.subtitles,
        playbackSpeed: data.playbackSpeed,
        allowVideoCall: data.allowVideoCall,
        allowVoiceCall: data.allowVoiceCall,
        allowScreenShare: data.allowScreenShare,
        defaultMeetingDuration: data.defaultMeetingDuration,
      },
    });

    return settings;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const bcrypt = require('bcrypt');

    // Get user with current password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive information
    const exportData = {
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        studyLevel: user.studyLevel,
        interests: user.interests,
        coursesCompleted: user.coursesCompleted,
        subjects: user.subjects,
        hourlyRate: user.hourlyRate,
        experience: user.experience,
        qualifications: user.qualifications,
        expertise: user.expertise,
        solvedQuestions: user.solvedQuestions,
        rating: user.rating,
        reviewCount: user.reviewCount,
        isProfilePublic: user.isProfilePublic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      settings: user.settings,
      enrollments: user.enrollments.map((enrollment) => ({
        id: enrollment.id,
        courseTitle: enrollment.course.title,
        courseDescription: enrollment.course.description,
        enrolledAt: enrollment.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };

    return exportData;
  }

  async deleteUserAccount(userId: string) {
    // This will cascade delete all related data due to schema relationships
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}
