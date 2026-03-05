import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RefreshDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private users: UsersService) {}

  async signup(dto: SignupDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.createUser({
      email: dto.email,
      passwordHash,
      type: dto.type,
      nickname: dto.nickname,
      languages: dto.languages ?? [],
    });

    const tokens = await this.issueTokens(user.id, user.email);
    await this.users.setRefreshTokenHash(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return { ok: true, data: { userId: user.id, ...tokens } };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email);
    await this.users.setRefreshTokenHash(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return { ok: true, data: { userId: user.id, ...tokens } };
  }

  async refresh(dto: RefreshDto) {
    // 1) refresh token 검증(서명)
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');

    // 2) 저장된 해시와 비교(탈취 방지)
    const ok = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.issueTokens(user.id, user.email);
    await this.users.setRefreshTokenHash(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return { ok: true, data: { userId: user.id, ...tokens } };
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email } as any,
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as any,
      } as any,
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId } as any,
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '14d') as any,
      } as any,
    );
    return { accessToken, refreshToken };
  }
}