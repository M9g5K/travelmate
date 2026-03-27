import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message:
      'Password must include letters, numbers, and special characters',
  })
  password: string;

  @IsString()
  nickname: string;

  @IsString()
  type: 'TRAVELER' | 'LOCAL';

  @IsString()
  country: string;

  languages: string[];

  bio?: string;
}