import {
  Injectable, NotFoundException, ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async findByUsername(username: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { username, activo: true } });
  }

  async findById(id: string): Promise<Usuario> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async findAll(): Promise<Partial<Usuario>[]> {
    return this.repo.find({
      select: {
        id: true,
        username: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        ultimoAcceso: true,
        creadoEn: true,
      },
      order: { nombreCompleto: 'ASC' },
    });
  }

  async crear(data: {
    username: string;
    password: string;
    nombreCompleto: string;
    correo?: string;
    rol: any;
  }): Promise<Usuario> {
    const existe = await this.repo.findOne({ where: { username: data.username } });
    if (existe) throw new ConflictException('El nombre de usuario ya existe');

    const hash = await bcrypt.hash(data.password, 10);
    const usuario = this.repo.create({
      username:       data.username,
      passwordHash:   hash,
      nombreCompleto: data.nombreCompleto,
      correo:         data.correo,
      rol:            data.rol,
    });
    return this.repo.save(usuario);
  }

  async actualizarRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.repo.update(id, {
      refreshTokenHash: hash,
    } as any);
  }

  async actualizarUltimoAcceso(id: string): Promise<void> {
    await this.repo.update(id, { ultimoAcceso: new Date() } as Partial<Usuario>);
  }

  async guardarResetToken(id: string, token: string): Promise<void> {
    const hash = await bcrypt.hash(token, 10);
    const expira = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await this.repo.update(id, {
      resetTokenHash:   hash,
      resetTokenExpira: expira,
    } as Partial<Usuario>);
  }

  async validarResetToken(username: string, token: string): Promise<Usuario | null> {
    const usuario = await this.repo.findOne({ where: { username } });
    if (!usuario?.resetTokenHash) return null;
    if (usuario.resetTokenExpira < new Date()) return null;
    const ok = await bcrypt.compare(token, usuario.resetTokenHash);
    return ok ? usuario : null;
  }

  async resetearPassword(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, {
      passwordHash:     hash,
      resetTokenHash:   null as any,
      resetTokenExpira: null as any,
    } as Partial<Usuario>);
  }

  async cambiarPassword(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { passwordHash: hash });
  }

  async desactivar(id: string): Promise<void> {
    await this.repo.update(id, { activo: false });
  }
}