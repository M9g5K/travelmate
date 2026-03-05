import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ Chat 멤버 검증 (traveler/local만 접근 가능)
   */
  async ensureChatMember(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { match: true },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const { travelerId, localId } = chat.match;
    if (travelerId !== userId && localId !== userId) {
      throw new ForbiddenException('Not your chat');
    }

    return chat;
  }

  /**
   * ✅ ChatMember row upsert (join/reconnect 시 보장)
   */
  async ensureChatMemberRow(chatId: string, userId: string) {
    await this.ensureChatMember(chatId, userId);

    return this.prisma.chatMember.upsert({
      where: { chatId_userId: { chatId, userId } },
      update: {},
      create: { chatId, userId },
    });
  }

  /**
   * 메시지 전송(저장)
   */
  async sendMessage(chatId: string, senderId: string, content: string) {
    await this.ensureChatMember(chatId, senderId);

    return this.prisma.message.create({
      data: { chatId, senderId, content },
      include: { sender: { select: { id: true, nickname: true, type: true } } },
    });
  }

  /**
   * 메시지 목록 조회(cursor pagination)
   * - take: 1~50
   * - cursor: 이전 페이지 마지막 message.id
   */
  async listMessages(chatId: string, userId: string, take = 30, cursor?: string) {
    await this.ensureChatMember(chatId, userId);

    const safeTake = Math.min(Math.max(take, 1), 50);

    // 최신 -> 과거 순으로 가져온 뒤 reverse 해서 과거->최신으로 리턴
    const items = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: safeTake,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { sender: { select: { id: true, nickname: true, type: true } } },
    });

    const data = items.slice().reverse();
    const nextCursor = items.length ? items[items.length - 1].id : null;

    return { data, nextCursor };
  }

  /**
   * ✅ missed sync: after messageId 기준으로 이후 메시지 가져오기
   * GET /chats/:chatId/messages/after?after=<messageId>&take=50
   */
  async listMessagesAfter(chatId: string, userId: string, afterMessageId: string, take = 50) {
    await this.ensureChatMember(chatId, userId);

    const after = await this.prisma.message.findUnique({ where: { id: afterMessageId } });
    if (!after || after.chatId !== chatId) {
      return { data: [], nextCursor: null };
    }

    const items = await this.prisma.message.findMany({
      where: {
        chatId,
        createdAt: { gt: after.createdAt },
      },
      orderBy: { createdAt: 'asc' },
      take: Math.min(Math.max(take, 1), 100),
      include: { sender: { select: { id: true, nickname: true, type: true } } },
    });

    const nextCursor = items.length ? items[items.length - 1].id : null;
    return { data: items, nextCursor };
  }

  /**
   * ✅ Read receipt 저장
   * - lastReadAt 갱신
   * - lastReadMsgId 옵션
   */
  async markSeen(chatId: string, userId: string, lastReadMsgId?: string) {
    await this.ensureChatMember(chatId, userId);

    const member = await this.prisma.chatMember.upsert({
      where: { chatId_userId: { chatId, userId } },
      update: {
        lastReadAt: new Date(),
        ...(lastReadMsgId ? { lastReadMsgId } : {}),
      },
      create: {
        chatId,
        userId,
        lastReadAt: new Date(),
        ...(lastReadMsgId ? { lastReadMsgId } : {}),
      },
    });

    return member;
  }

  /**
   * ✅ 인박스: 내 채팅방 목록 (PostgreSQL 최적화 버전)
   * - chat/상대/request/lastMessage/unreadCount를 1번 쿼리로 계산
   * - DISTINCT ON + CTE 사용
   */
  async listMyChats(userId: string, take = 20) {
    const safeTake = Math.min(Math.max(take, 1), 50);

    const rows = await this.prisma.$queryRaw<any[]>`
      WITH my_chats AS (
        SELECT
          cm."chatId"           AS "chatId",
          cm."lastReadAt"       AS "lastReadAt",
          cm."lastReadMsgId"    AS "lastReadMsgId",
          cm."updatedAt"        AS "memberUpdatedAt"
        FROM "ChatMember" cm
        WHERE cm."userId" = ${userId}
        ORDER BY cm."updatedAt" DESC
        LIMIT ${safeTake}
      ),
      last_msg AS (
        SELECT DISTINCT ON (m."chatId")
          m."chatId"    AS "chatId",
          m."id"        AS "id",
          m."senderId"  AS "senderId",
          m."content"   AS "content",
          m."createdAt" AS "createdAt"
        FROM "Message" m
        WHERE m."chatId" IN (SELECT "chatId" FROM my_chats)
        ORDER BY m."chatId", m."createdAt" DESC
      ),
      unread AS (
        SELECT
          m."chatId" AS "chatId",
          COUNT(*)::int AS "unreadCount"
        FROM "Message" m
        JOIN my_chats c ON c."chatId" = m."chatId"
        WHERE (c."lastReadAt" IS NULL OR m."createdAt" > c."lastReadAt")
        GROUP BY m."chatId"
      )
      SELECT
        c."chatId" AS "chatId",
        ch."createdAt" AS "chatCreatedAt",

        mt."id" AS "matchId",

        rq."id" AS "requestId",
        rq."city" AS "requestCity",
        rq."startDate" AS "requestStartDate",
        rq."endDate" AS "requestEndDate",
        rq."tags" AS "requestTags",
        rq."status" AS "requestStatus",

        CASE WHEN mt."travelerId" = ${userId} THEN lu."id" ELSE tu."id" END AS "counterpartId",
        CASE WHEN mt."travelerId" = ${userId} THEN lu."nickname" ELSE tu."nickname" END AS "counterpartNickname",
        CASE WHEN mt."travelerId" = ${userId} THEN lu."type" ELSE tu."type" END AS "counterpartType",

        lm."id" AS "lastMessageId",
        lm."senderId" AS "lastMessageSenderId",
        lm."content" AS "lastMessageContent",
        lm."createdAt" AS "lastMessageCreatedAt",

        COALESCE(u."unreadCount", 0) AS "unreadCount",

        c."lastReadAt" AS "lastReadAt",
        c."lastReadMsgId" AS "lastReadMsgId",
        c."memberUpdatedAt" AS "memberUpdatedAt"
      FROM my_chats c
      JOIN "Chat" ch ON ch."id" = c."chatId"
      JOIN "Match" mt ON mt."id" = ch."matchId"
      JOIN "Request" rq ON rq."id" = mt."requestId"
      JOIN "User" tu ON tu."id" = mt."travelerId"
      JOIN "User" lu ON lu."id" = mt."localId"
      LEFT JOIN last_msg lm ON lm."chatId" = c."chatId"
      LEFT JOIN unread u ON u."chatId" = c."chatId"
      ORDER BY COALESCE(lm."createdAt", ch."createdAt") DESC
    `;

    return rows.map((r) => ({
      chatId: r.chatId,
      matchId: r.matchId,
      request: {
        id: r.requestId,
        city: r.requestCity,
        startDate: r.requestStartDate,
        endDate: r.requestEndDate,
        tags: r.requestTags,
        status: r.requestStatus,
      },
      counterpart: {
        id: r.counterpartId,
        nickname: r.counterpartNickname,
        type: r.counterpartType,
      },
      lastMessage: r.lastMessageId
        ? {
            id: r.lastMessageId,
            chatId: r.chatId,
            senderId: r.lastMessageSenderId,
            content: r.lastMessageContent,
            createdAt: r.lastMessageCreatedAt,
          }
        : null,
      unreadCount: r.unreadCount,
      lastReadAt: r.lastReadAt,
      lastReadMsgId: r.lastReadMsgId,
    }));
  }

  /**
   * ✅ 채팅방 상세(헤더)
   * - request 요약
   * - counterpart(상대)
   * - 내/상대 read receipt
   */
  async getChatDetail(chatId: string, userId: string) {
    // 권한 체크
    await this.ensureChatMember(chatId, userId);

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        match: {
          include: {
            request: true,
            traveler: { select: { id: true, nickname: true, type: true } },
            local: { select: { id: true, nickname: true, type: true } },
          },
        },
        members: {
          select: {
            userId: true,
            lastReadAt: true,
            lastReadMsgId: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const match = chat.match;

    const counterpart = match.travelerId === userId ? match.local : match.traveler;

    const myMember = chat.members.find((m) => m.userId === userId) ?? null;
    const peerMember = chat.members.find((m) => m.userId !== userId) ?? null;

    return {
      chatId: chat.id,
      matchId: match.id,
      request: {
        id: match.request.id,
        city: match.request.city,
        startDate: match.request.startDate,
        endDate: match.request.endDate,
        tags: match.request.tags,
        status: match.request.status,
        description: (match.request as any).description ?? null,
      },
      counterpart,
      myRead: myMember
        ? {
            lastReadAt: myMember.lastReadAt ?? null,
            lastReadMsgId: myMember.lastReadMsgId ?? null,
            updatedAt: myMember.updatedAt,
          }
        : { lastReadAt: null, lastReadMsgId: null, updatedAt: null },
      peerRead: peerMember
        ? {
            userId: peerMember.userId,
            lastReadAt: peerMember.lastReadAt ?? null,
            lastReadMsgId: peerMember.lastReadMsgId ?? null,
            updatedAt: peerMember.updatedAt,
          }
        : { userId: null, lastReadAt: null, lastReadMsgId: null, updatedAt: null },
    };
  }
}