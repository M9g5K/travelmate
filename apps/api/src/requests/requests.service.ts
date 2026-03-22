import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptLikeDto, CreateRequestDto } from './dto';
import { BlocksService } from '../blocks/blocks.service';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private blocksService: BlocksService,
  ) {}

  create(travelerId: string, dto: CreateRequestDto) {
    return this.prisma.request.create({
      data: {
        travelerId,
        city: dto.city,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        tags: dto.tags,
        description: dto.description,
        modeInfoOnly: dto.modeInfoOnly ?? false,
        modeChat: dto.modeChat ?? true,
        modeOffline: dto.modeOffline ?? false,
      },
    });
  }

  listMine(travelerId: string) {
    return this.prisma.request.findMany({
      where: { travelerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listActiveForLocals(localId: string) {
    const hiddenUserIds = await this.blocksService.getHiddenUserIds(localId);

    return this.prisma.request.findMany({
      where: {
        status: 'ACTIVE',
        ...(hiddenUserIds.length > 0
          ? {
              travelerId: {
                notIn: hiddenUserIds,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        traveler: { select: { id: true, nickname: true, type: true } },
      },
    });
  }

  async listLikes(travelerId: string, requestId: string) {
    const req = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.travelerId !== travelerId) throw new ForbiddenException('Not your request');

    const hiddenUserIds = await this.blocksService.getHiddenUserIds(travelerId);

    return this.prisma.like.findMany({
      where: {
        requestId,
        ...(hiddenUserIds.length > 0
          ? {
              localId: {
                notIn: hiddenUserIds,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        local: { select: { id: true, nickname: true, type: true } },
      },
    });
  }

  async like(localId: string, requestId: string) {
    const req = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'ACTIVE') throw new BadRequestException('Request is not active');

    const hiddenUserIds = await this.blocksService.getHiddenUserIds(localId);
    if (hiddenUserIds.includes(req.travelerId)) {
      throw new ForbiddenException('Request not available');
    }

    return this.prisma.like.upsert({
      where: { requestId_localId: { requestId, localId } },
      update: { status: 'PENDING' },
      create: { requestId, localId, status: 'PENDING' },
    });
  }

  // A 플로우 핵심: local이 like -> traveler가 accept -> match + chat 생성(트랜잭션)
  async acceptLike(travelerId: string, requestId: string, dto: AcceptLikeDto) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.request.findUnique({ where: { id: requestId } });
      if (!req) throw new NotFoundException('Request not found');
      if (req.travelerId !== travelerId) throw new ForbiddenException('Not your request');
      if (req.status !== 'ACTIVE') throw new BadRequestException('Request is not active');

      const like = await tx.like.findUnique({ where: { id: dto.likeId } });
      if (!like || like.requestId !== requestId) {
        throw new NotFoundException('Like not found');
      }

      const hiddenUserIds = await this.blocksService.getHiddenUserIds(travelerId);
      if (hiddenUserIds.includes(like.localId)) {
        throw new ForbiddenException('Cannot accept blocked user');
      }

      await tx.like.update({
        where: { id: like.id },
        data: { status: 'ACCEPTED' },
      });

      await tx.like.updateMany({
        where: { requestId, id: { not: like.id } },
        data: { status: 'REJECTED' },
      });

      await tx.request.update({
        where: { id: requestId },
        data: { status: 'MATCHED' },
      });

      const match = await tx.match.create({
        data: {
          requestId,
          travelerId: req.travelerId,
          localId: like.localId,
          status: 'ACTIVE',
        },
      });

      const chat = await tx.chat.create({
        data: { matchId: match.id },
      });

      return { match, chat };
    });
  }
}