import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    if (reporterId === dto.targetUserId) {
      throw new BadRequestException('You cannot report yourself');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('Target user not found');
    }

    if (dto.chatId) {
      const chat = await this.prisma.chat.findUnique({
        where: { id: dto.chatId },
        select: { id: true },
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    }

    return this.prisma.report.create({
      data: {
        reporterId,
        targetUserId: dto.targetUserId,
        chatId: dto.chatId,
        reason: dto.reason,
        detail: dto.detail,
      },
      select: {
        id: true,
        reporterId: true,
        targetUserId: true,
        chatId: true,
        reason: true,
        detail: true,
        createdAt: true,
      },
    });
  }

  async getMine(reporterId: string) {
    return this.prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        detail: true,
        chatId: true,
        createdAt: true,
        targetUser: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
          },
        },
      },
    });
  }
}