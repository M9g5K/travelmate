import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async create(blockerId: string, dto: CreateBlockDto) {
    if (blockerId === dto.blockedUserId) {
      throw new BadRequestException('You cannot block yourself');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: dto.blockedUserId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('Target user not found');
    }

    const exists = await this.prisma.block.findUnique({
      where: {
        blockerId_blockedUserId: {
          blockerId,
          blockedUserId: dto.blockedUserId,
        },
      },
      select: { id: true },
    });

    if (exists) {
      return {
        id: exists.id,
        blockerId,
        blockedUserId: dto.blockedUserId,
        alreadyBlocked: true,
      };
    }

    return this.prisma.block.create({
      data: {
        blockerId,
        blockedUserId: dto.blockedUserId,
      },
      select: {
        id: true,
        blockerId: true,
        blockedUserId: true,
        createdAt: true,
      },
    });
  }

  async getMine(blockerId: string) {
    return this.prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        blockedUser: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            profileImageUrl: true,
          },
        },
      },
    });
  }
}
