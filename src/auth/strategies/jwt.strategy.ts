import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const jwtSecret = config.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: (req) => {
        const fromBearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (fromBearer) return fromBearer;

        const headerValue = req?.headers?.authorization;
        if (!headerValue) return null;

        const values = Array.isArray(headerValue) ? headerValue : [headerValue];
        for (const value of values) {
          const normalized = value.trim();
          if (!normalized) continue;
          if (normalized.toLowerCase().startsWith('bearer ')) {
            return normalized.slice(7).trim();
          }
          return normalized;
        }

        return null;
      },
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    return { sub: payload.sub, username: payload.username, rol: payload.rol };
  }
}