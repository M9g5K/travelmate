import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  // traveler/local 공통: 내 매칭 목록
  listMine(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [{ travelerId: userId }, { localId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        chat: true,
        request: true,
        traveler: { select: { id: true, nickname: true, type: true } },
        local: { select: { id: true, nickname: true, type: true } },
      },
    });
  }

  // 매칭 상세: 본인 매칭인지 검증
  async getByIdForUser(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        chat: true,
        request: true,
        traveler: { select: { id: true, nickname: true, type: true } },
        local: { select: { id: true, nickname: true, type: true } },
      },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.travelerId !== userId && match.localId !== userId) {
      throw new ForbiddenException('Not your match');
    }

    return match;
  }
}