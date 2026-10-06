import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escuela } from './escuela.entity.js';
import { TecnicoMineduc } from './tecnico-mineduc.entity.js';
import { UsuarioEscuela } from './usuario-escuela.entity.js';
import { CreateEscuelaDto } from './dto/create-escuela.dto.js';
import { UpdateEscuelaDto } from './dto/update-escuela.dto.js';

@Injectable()
export class EscuelasService {
  constructor(
    @InjectRepository(Escuela)
    private readonly escuelaRepo: Repository<Escuela>,
    @InjectRepository(TecnicoMineduc)
    private readonly tecnicoRepo: Repository<TecnicoMineduc>,
    @InjectRepository(UsuarioEscuela)
    private readonly ueRepo: Repository<UsuarioEscuela>,
  ) {}

  async findAll(): Promise<Escuela[]> {
    return this.escuelaRepo.find({
      where: { activa: true },
      order: { nombre: 'ASC' },
    });
  }

  async findById(id: string): Promise<Escuela> {
    const e = await this.escuelaRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Escuela no encontrada');
    return e;
  }

  async crear(dto: CreateEscuelaDto): Promise<Escuela> {
    const escuela = this.escuelaRepo.create({
      codigoMineduc:  dto.codigoMineduc,
      nombre:         dto.nombre,
      municipio:      dto.municipio,
      departamento:   dto.departamento,
      direccion:      dto.direccion,
      matriculaActual: dto.matriculaActual,
    });
    if (dto.tecnicoId) {
      const tecnico = await this.tecnicoRepo.findOne({ where: { id: dto.tecnicoId } });
      if (tecnico) escuela.tecnico = tecnico;
    }
    return this.escuelaRepo.save(escuela);
  }

  async actualizar(id: string, dto: UpdateEscuelaDto): Promise<Escuela> {
    const escuela = await this.findById(id);
    if (dto.tecnicoId) {
      const tecnico = await this.tecnicoRepo.findOne({ where: { id: dto.tecnicoId } });
      if (tecnico) escuela.tecnico = tecnico;
      delete (dto as any).tecnicoId;
    }
    Object.assign(escuela, dto);
    return this.escuelaRepo.save(escuela);
  }

  async desactivar(id: string): Promise<{ ok: boolean; mensaje: string }> {
    await this.findById(id);
    await this.escuelaRepo.update(id, { activa: false });
    return { ok: true, mensaje: 'Escuela desactivada correctamente' };
  }

  async getUsuariosPorEscuela(escuelaId: string) {
    return this.ueRepo.find({ where: { escuela: { id: escuelaId }, activo: true } });
  }

  async asignarUsuario(escuelaId: string, usuarioId: string) {
    const ue = this.ueRepo.create({
      escuela:  { id: escuelaId } as any,
      usuario:  { id: usuarioId } as any,
    });
    return this.ueRepo.save(ue);
  }
}