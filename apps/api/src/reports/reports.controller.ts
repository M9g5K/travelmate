import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    const report = await this.reportsService.create(user.userId, dto);

    return {
      data: report,
    };
  }

  @Get('mine')
  async getMine(@CurrentUser() user: any) {
    const reports = await this.reportsService.getMine(user.userId);

    return {
      data: reports,
    };
  }
}