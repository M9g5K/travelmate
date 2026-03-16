import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeProfileDto } from './dto/update-me-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    type: string;
    nickname: string;
    languages: string[];
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        type: true,
        languages: true,
        country: true,
        bio: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMeProfile(userId: string, dto: UpdateMeProfileDto) {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.nickname !== undefined ? { nickname: dto.nickname } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.languages !== undefined ? { languages: dto.languages } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.profileImageUrl !== undefined
          ? { profileImageUrl: dto.profileImageUrl }
          : {}),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        type: true,
        languages: true,
        country: true,
        bio: true,
        profileImageUrl: true,
      },
    });
  }

  async updateProfileImage(userId: string, profileImageUrl: string) {
    const exists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        type: true,
        languages: true,
        country: true,
        bio: true,
        profileImageUrl: true,
      },
    });
  }
}