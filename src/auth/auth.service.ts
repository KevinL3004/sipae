import {
  Injectable, UnauthorizedException,
  ForbiddenException, BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Login ────────────────────────────────────────────────
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

  // ── Register ─────────────────────────────────────────────
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

  // ── Logout ────────────────────────────────────────────────
  async logout(userId: string) {
    await this.usersService.actualizarRefreshToken(userId, null);
    return { ok: true, mensaje: 'Sesión cerrada correctamente' };
  }

  // ── Refresh token ─────────────────────────────────────────
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

  // ── Forgot password ───────────────────────────────────────
  async forgotPassword(username: string) {
    const usuario = await this.usersService.findByUsername(username);

    // Siempre responder igual para no revelar si el usuario existe
    if (!usuario) {
      return {
        ok: true,
        mensaje: 'Si el usuario existe, recibirá el token de recuperación.',
        data: null,
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.guardarResetToken(usuario.id, resetToken);

    // En producción aquí iría el envío por email o SMS.
    // En desarrollo devolvemos el token directamente para probar en Postman.
    return {
      ok: true,
      mensaje: 'Token de recuperación generado. Válido por 30 minutos.',
      data: {
        reset_token: resetToken,   // ← quitar en producción
        expira_en:   '30 minutos',
      },
    };
  }

  // ── Reset password ────────────────────────────────────────
  async resetPassword(username: string, token: string, newPassword: string) {
    const usuario = await this.usersService.validarResetToken(username, token);
    if (!usuario)
      throw new BadRequestException('Token inválido o expirado');

    await this.usersService.resetearPassword(usuario.id, newPassword);
    return { ok: true, mensaje: 'Contraseña actualizada correctamente' };
  }

  // ── Change password (usuario autenticado) ─────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const usuario = await this.usersService.findById(userId);
    const ok = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!ok) throw new BadRequestException('La contraseña actual es incorrecta');

    await this.usersService.cambiarPassword(userId, dto.passwordNuevo);
    return { ok: true, mensaje: 'Contraseña cambiada correctamente' };
  }

  // ── Helper privado ────────────────────────────────────────
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