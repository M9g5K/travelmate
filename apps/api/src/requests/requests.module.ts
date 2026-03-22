import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [PrismaModule, BlocksModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}