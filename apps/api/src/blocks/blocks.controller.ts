import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateBlockDto } from './dto/create-block.dto';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateBlockDto) {
    const block = await this.blocksService.create(user.userId, dto);

    return {
      data: block,
    };
  }

  @Get()
  async getMine(@CurrentUser() user: any) {
    const blocks = await this.blocksService.getMine(user.userId);

    return {
      data: blocks,
    };
  }

  @Delete(':blockedUserId')
  async remove(
    @CurrentUser() user: any,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    const removed = await this.blocksService.remove(user.userId, blockedUserId);

    return {
      data: removed,
    };
  }
}