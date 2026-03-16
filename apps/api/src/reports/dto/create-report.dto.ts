import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  targetUserId!: string;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsString()
  @IsIn([
    'harassment',
    'spam',
    'scam',
    'abusive_language',
    'inappropriate_behavior',
    'other',
  ])
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  detail?: string;
}