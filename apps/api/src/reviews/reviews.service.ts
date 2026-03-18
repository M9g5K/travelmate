import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    if (reviewerId === dto.targetUserId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      select: {
        id: true,
        travelerId: true,
        localId: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const isParticipant =
      match.travelerId === reviewerId || match.localId === reviewerId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this match');
    }

    const validTarget =
      dto.targetUserId === match.travelerId || dto.targetUserId === match.localId;

    if (!validTarget) {
      throw new BadRequestException('Target user is not part of this match');
    }

    if (dto.targetUserId === reviewerId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('Target user not found');
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        reviewerId_matchId: {
          reviewerId,
          matchId: dto.matchId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('You already reviewed this match');
    }

    return this.prisma.review.create({
      data: {
        reviewerId,
        targetUserId: dto.targetUserId,
        matchId: dto.matchId,
        rating: dto.rating,
        comment: dto.comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            profileImageUrl: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            profileImageUrl: true,
          },
        },
        match: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async getForUser(userId: string) {
    return this.prisma.review.findMany({
      where: {
        targetUserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            profileImageUrl: true,
          },
        },
        match: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}