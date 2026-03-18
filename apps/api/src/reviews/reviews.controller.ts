import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    const review = await this.reviewsService.create(user.userId, dto);

    return {
      data: review,
    };
  }

  @Get('users/:id')
  async getForUser(@Param('id') id: string) {
    const reviews = await this.reviewsService.getForUser(id);

    return {
      data: reviews,
    };
  }
}