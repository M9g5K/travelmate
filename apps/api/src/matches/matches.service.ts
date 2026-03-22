import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlocksService } from '../blocks/blocks.service';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private blocksService: BlocksService,
  ) {}

  async getMine(userId: string) {
    const hiddenUserIds = await this.blocksService.getHiddenUserIds(userId);

    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ travelerId: userId }, { localId: userId }],
        ...(hiddenUserIds.length > 0
          ? {
              AND: [
                {
                  travelerId: {
                    notIn: hiddenUserIds,
                  },
                },
                {
                  localId: {
                    notIn: hiddenUserIds,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        request: true,
        chat: {
          select: {
            id: true,
          },
        },
        traveler: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            languages: true,
            profileImageUrl: true,
          },
        },
        local: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            languages: true,
            profileImageUrl: true,
          },
        },
      },
    });

    return matches.map((match) => {
      const isTraveler = match.travelerId === userId;
      const counterpart = isTraveler ? match.local : match.traveler;

      return {
        id: match.id,
        status: match.status,
        chatId: match.chat?.id ?? null,
        request: {
          id: match.request.id,
          city: match.request.city,
          tags: match.request.tags,
          description: match.request.description,
        },
        counterpart: counterpart
          ? {
              id: counterpart.id,
              nickname: counterpart.nickname,
              type: counterpart.type,
              country: counterpart.country,
              languages: counterpart.languages,
              profileImageUrl: counterpart.profileImageUrl,
            }
          : null,
      };
    });
  }

  async getById(matchId: string, userId: string) {
    const hiddenUserIds = await this.blocksService.getHiddenUserIds(userId);

    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ travelerId: userId }, { localId: userId }],
        ...(hiddenUserIds.length > 0
          ? {
              AND: [
                {
                  travelerId: {
                    notIn: hiddenUserIds,
                  },
                },
                {
                  localId: {
                    notIn: hiddenUserIds,
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        request: true,
        chat: {
          select: {
            id: true,
          },
        },
        traveler: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            languages: true,
            profileImageUrl: true,
          },
        },
        local: {
          select: {
            id: true,
            nickname: true,
            type: true,
            country: true,
            languages: true,
            profileImageUrl: true,
          },
        },
      },
    });

    if (!match) return null;

    const isTraveler = match.travelerId === userId;
    const counterpart = isTraveler ? match.local : match.traveler;

    return {
      id: match.id,
      status: match.status,
      chatId: match.chat?.id ?? null,
      request: {
        id: match.request.id,
        city: match.request.city,
        tags: match.request.tags,
        description: match.request.description,
      },
      counterpart: counterpart
        ? {
            id: counterpart.id,
            nickname: counterpart.nickname,
            type: counterpart.type,
            country: counterpart.country,
            languages: counterpart.languages,
            profileImageUrl: counterpart.profileImageUrl,
          }
        : null,
    };
  }
}