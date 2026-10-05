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
        const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (bearerToken) return bearerToken;

        const authHeader = req?.headers?.authorization;
        if (!authHeader) return null;

        if (Array.isArray(authHeader)) {
          const firstHeader = authHeader[0]?.trim();
          if (!firstHeader) return null;
          return firstHeader.startsWith('Bearer ') ? firstHeader.slice(7).trim() : firstHeader;
        }

        const headerValue = authHeader.trim();
        if (!headerValue) return null;
        return headerValue.startsWith('Bearer ') ? headerValue.slice(7).trim() : headerValue;
      },
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    return { sub: payload.sub, username: payload.username, rol: payload.rol };
  }
}