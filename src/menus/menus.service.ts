import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuOficial, EstadoMenu } from './menu-oficial.entity.js';
import { Alimento } from './alimento.entity.js';
import { DiaMenu } from './dia-menu.entity.js';
import { IngredienteDia } from './ingrediente-dia.entity.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { CreateAlimentoDto } from './dto/create-alimento.dto.js';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuOficial)
    private readonly menuRepo: Repository<MenuOficial>,
    @InjectRepository(Alimento)
    private readonly alimentoRepo: Repository<Alimento>,
    @InjectRepository(DiaMenu)
    private readonly diaRepo: Repository<DiaMenu>,
    @InjectRepository(IngredienteDia)
    private readonly ingRepo: Repository<IngredienteDia>,
    @InjectRepository(TecnicoMineduc)
    private readonly tecnicoRepo: Repository<TecnicoMineduc>,
  ) {}

  // ── Alimentos ────────────────────────────────────────────
  async getAlimentos() {
    return this.alimentoRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async crearAlimento(dto: CreateAlimentoDto) {
    const alimento = this.alimentoRepo.create(dto);
    return this.alimentoRepo.save(alimento);
  }

  // ── Menús ────────────────────────────────────────────────
  async findAll() {
    return this.menuRepo.find({ order: { creadoEn: 'DESC' } });
  }

  async findById(id: string) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menú no encontrado');
    return menu;
  }

  async findVigente() {
    const hoy = new Date().toISOString().split('T')[0];
    return this.menuRepo.findOne({
      where: { estado: EstadoMenu.VIGENTE },
    });
  }

  async crear(dto: CreateMenuDto, usuarioId: string) {
    const tecnico = await this.tecnicoRepo.findOne({
      where: { usuario: { id: usuarioId } },
      relations: { usuario: true },
    });

    if (!tecnico) {
      throw new NotFoundException('No existe un técnico asociado a este usuario');
    }

    const menu = this.menuRepo.create({
      nombre:      dto.nombre,
      descripcion: dto.descripcion,
      fechaInicio: dto.fechaInicio,
      fechaFin:    dto.fechaFin,
      tecnico:     { id: tecnico.id } as any,
    });

    if (dto.dias?.length) {
      menu.dias = await Promise.all(
        dto.dias.map(async (dDto) => {
          const dia = this.diaRepo.create({
            semanaNumero:        dDto.semanaNumero,
            dia:                 dDto.dia,
            descripcionRefaccion: dDto.descripcionRefaccion,
            kcalEstimadas:       dDto.kcalEstimadas,
            observaciones:       dDto.observaciones,
          });
          if (dDto.ingredientes?.length) {
            dia.ingredientes = dDto.ingredientes.map((i) =>
              this.ingRepo.create({
                alimento:               { id: i.alimentoId } as any,
                cantidadPorEstudianteG: i.cantidadPorEstudianteG,
                unidad:                 i.unidad ?? 'g',
              }),
            );
          }
          return dia;
        }),
      );
    }

    return this.menuRepo.save(menu);
  }

  async publicar(id: string) {
    await this.findById(id);
    await this.menuRepo.update(id, { estado: EstadoMenu.PUBLICADO });
    return { ok: true, mensaje: 'Menú publicado correctamente' };
  }

  async marcarVigente(id: string) {
    // Vencer el anterior vigente si existe
    await this.menuRepo.update(
      { estado: EstadoMenu.VIGENTE },
      { estado: EstadoMenu.VENCIDO },
    );
    await this.menuRepo.update(id, { estado: EstadoMenu.VIGENTE });
    return { ok: true, mensaje: 'Menú marcado como vigente' };
  }
}