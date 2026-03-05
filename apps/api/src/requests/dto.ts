import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  city!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  tags!: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  modeInfoOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  modeChat?: boolean;

  @IsOptional()
  @IsBoolean()
  modeOffline?: boolean;
}

export class AcceptLikeDto {
  @IsString()
  likeId!: string;
}