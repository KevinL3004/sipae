import {
  Injectable, UnauthorizedException, ForbiddenException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usersService.findByUsername(dto.username);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const passOk = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passOk) throw new UnauthorizedException('Credenciales incorrectas');

    await this.usersService.actualizarUltimoAcceso(usuario.id);

    const tokens = await this._generarTokens(usuario.id, usuario.username, usuario.rol);

    const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.actualizarRefreshToken(usuario.id, refreshHash);

    return {
      ok: true,
      mensaje: `Bienvenido, ${usuario.nombreCompleto}`,
      data: {
        ...tokens,
        usuario: {
          id:             usuario.id,
          username:       usuario.username,
          nombreCompleto: usuario.nombreCompleto,
          correo:         usuario.correo,
          rol:            usuario.rol,
        },
      },
    };
  }

  async register(dto: RegisterDto) {
    const usuario = await this.usersService.crear(dto);
    return {
      ok: true,
      mensaje: 'Usuario creado correctamente',
      data: {
        id:             usuario.id,
        username:       usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        rol:            usuario.rol,
      },
    };
  }

  async logout(userId: string) {
    await this.usersService.actualizarRefreshToken(userId, null);
    return { ok: true, mensaje: 'Sesión cerrada correctamente' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const usuario = await this.usersService.findById(userId);
    if (!usuario?.refreshTokenHash)
      throw new ForbiddenException('Acceso denegado');

    const coincide = await bcrypt.compare(refreshToken, usuario.refreshTokenHash);
    if (!coincide) throw new ForbiddenException('Token inválido');

    const tokens = await this._generarTokens(usuario.id, usuario.username, usuario.rol);
    const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.actualizarRefreshToken(usuario.id, refreshHash);

    return { ok: true, data: tokens };
  }

  private async _generarTokens(userId: string, username: string, rol: string) {
    const payload = { sub: userId, username, rol };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:    this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret:    this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { access_token, refresh_token, token_type: 'Bearer' };
  }
}