import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('mine')
  async getMine(@CurrentUser() user: any) {
    const matches = await this.matchesService.getMine(user.userId);

    return {
      data: matches,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.matchesService.getById(id, user.userId);
  }
}