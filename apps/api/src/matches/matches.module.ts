import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [PrismaModule, BlocksModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}