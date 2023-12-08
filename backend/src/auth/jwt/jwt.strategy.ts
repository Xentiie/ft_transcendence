import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config_jwt } from 'src/config';
import { Request } from '../interfaces/request.interface';
import { JwtPayload } from '../interfaces/jwtpayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJwtCookie
      ]),
      secretOrKey: config_jwt.secret_token,
    });
  }

  private static extractJwtCookie(request: Request): string | null {
    if (request.cookies && 'access_token' in request.cookies)
      return request?.cookies?.access_token;
    return null;
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload
  }
}
