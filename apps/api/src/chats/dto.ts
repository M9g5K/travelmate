import { IsString, MinLength, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;
}

export class SeenDto {
  @IsOptional()
  @IsString()
  lastReadMsgId?: string;
}