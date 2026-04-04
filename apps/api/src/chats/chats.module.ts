import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [PrismaModule, BlocksModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  NotificationsModule,
})
export class ChatsModule {}