import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsArray } from 'class-validator';

export enum UserType {
  TRAVELER = 'TRAVELER',
  LOCAL = 'LOCAL',
}

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(UserType)
  type!: UserType;

  @IsString()
  nickname!: string;

  @IsOptional()
  @IsArray()
  languages?: string[];
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}