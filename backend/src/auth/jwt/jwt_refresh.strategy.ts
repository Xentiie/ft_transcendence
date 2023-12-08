import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { config_jwt } from 'src/config';
import { JwtPayload } from '../interfaces/jwtpayload.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtRefreshTokenStrategy.extractJwtRefreshCookie
      ]),
      secretOrKey: config_jwt.secret_refresh,
      passReqToCallback: true,
    })
  }

  private static extractJwtRefreshCookie(request): string | null {
    if (request.cookies && 'refresh_token' in request.cookies)
      return request.cookies.refresh_token;
    return null;
  }

  async validate(request, payload: JwtPayload) {
    try {
      if (!request.cookies.refresh_token)
        throw new UnauthorizedException('No refresh token provided');
      return payload;
    } catch (error) {
      console.error(error)
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
