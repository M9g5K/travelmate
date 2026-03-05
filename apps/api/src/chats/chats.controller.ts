import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChatsService } from './chats.service';
import { SeenDto, SendMessageDto } from './dto';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private chats: ChatsService) {}

  // ✅ Inbox: 내 채팅방 목록
  @Get('mine')
  async mine(@Req() req: any, @Query('take') take?: string) {
    const list = await this.chats.listMyChats(req.user.userId, take ? Number(take) : 20);
    return { ok: true, data: list };
  }

  // 메시지 전송(REST)
  @Post(':chatId/messages')
  async send(@Req() req: any, @Param('chatId') chatId: string, @Body() dto: SendMessageDto) {
    const msg = await this.chats.sendMessage(chatId, req.user.userId, dto.content);
    return { ok: true, data: msg };
  }

  // 메시지 목록(cursor pagination)
  @Get(':chatId/messages')
  async list(
    @Req() req: any,
    @Param('chatId') chatId: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const res = await this.chats.listMessages(chatId, req.user.userId, take ? Number(take) : 30, cursor);
    return { ok: true, ...res };
  }

  // ✅ missed sync (after messageId)
  @Get(':chatId/messages/after')
  async after(
    @Req() req: any,
    @Param('chatId') chatId: string,
    @Query('after') afterId: string,
    @Query('take') take?: string,
  ) {
    const res = await this.chats.listMessagesAfter(chatId, req.user.userId, afterId, take ? Number(take) : 50);
    return { ok: true, ...res };
  }

  @Get(':chatId')
  async detail(@Req() req: any, @Param('chatId') chatId: string) {
    const data = await this.chats.getChatDetail(chatId, req.user.userId);
    return { ok: true, data };
  }

  // ✅ read receipt (REST)
  @Post(':chatId/seen')
  async seen(@Req() req: any, @Param('chatId') chatId: string, @Body() dto: SeenDto) {
    const member = await this.chats.markSeen(chatId, req.user.userId, dto.lastReadMsgId);
    return { ok: true, data: member };
  }
}