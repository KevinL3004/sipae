import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
      username: data.username,
      passwordHash: hash,
      nombreCompleto: data.nombreCompleto,
      correo: data.correo,
      rol: data.rol,
    });
    return this.repo.save(usuario);
  }

  async actualizarRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.repo.update(id, {
      refreshTokenHash: hash ?? undefined,
    });
  }

  async actualizarUltimoAcceso(id: string): Promise<void> {
    await this.repo.update(id, { ultimoAcceso: new Date() });
  }

  async desactivar(id: string): Promise<void> {
    await this.repo.update(id, { activo: false });
  }
}