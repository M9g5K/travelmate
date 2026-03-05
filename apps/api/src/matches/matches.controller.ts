import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { MatchesService } from './matches.service';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private matches: MatchesService) {}

  @Get('mine')
  async mine(@Req() req: any) {
    const list = await this.matches.listMine(req.user.userId);
    return { ok: true, data: list };
  }

  @Get(':id')
  async detail(@Req() req: any, @Param('id') id: string) {
    const match = await this.matches.getByIdForUser(id, req.user.userId);
    return { ok: true, data: match };
  }
}