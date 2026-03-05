import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AcceptLikeDto, CreateRequestDto } from './dto';
import { RequestsService } from './requests.service';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private requests: RequestsService) {}

  // Traveler: 요청 생성
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateRequestDto) {
    const created = await this.requests.create(req.user.userId, dto);
    return { ok: true, data: created };
  }

  // Traveler: 내 요청 목록
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async mine(@Req() req: any) {
    const list = await this.requests.listMine(req.user.userId);
    return { ok: true, data: list };
  }

  // Local: 활성 요청 목록 조회
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async listActive() {
    const list = await this.requests.listActiveForLocals();
    return { ok: true, data: list };
  }

  // Local: like
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Req() req: any, @Param('id') requestId: string) {
    const like = await this.requests.like(req.user.userId, requestId);
    return { ok: true, data: like };
  }

  // Traveler: 특정 요청의 like 목록
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/likes')
  async likes(@Req() req: any, @Param('id') requestId: string) {
    const likes = await this.requests.listLikes(req.user.userId, requestId);
    return { ok: true, data: likes };
  }

  // Traveler: accept (body: { likeId })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  async accept(@Req() req: any, @Param('id') requestId: string, @Body() dto: AcceptLikeDto) {
    const result = await this.requests.acceptLike(req.user.userId, requestId, dto);
    return { ok: true, data: result };
  }
}