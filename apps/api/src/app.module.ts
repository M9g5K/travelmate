import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { MatchesModule } from './matches/matches.module';
import { ChatsModule } from './chats/chats.module';
import { ReportsModule } from './reports/reports.module';
import { BlocksModule } from './blocks/blocks.module';
import { ReviewsModule } from './reviews/reviews.module';

import { TestGateway } from './test.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    RequestsModule,
    MatchesModule,
    ChatsModule,
    ReportsModule,
    BlocksModule,
    ReviewsModule,
  ],
  providers: [TestGateway],
})
export class AppModule {}