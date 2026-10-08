import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { readFile } from 'node:fs/promises';
import { MenuOficial, EstadoMenu } from './menu-oficial.entity.js';
import { Alimento } from './alimento.entity.js';
import { DiaMenu } from './dia-menu.entity.js';
import { IngredienteDia } from './ingrediente-dia.entity.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { CreateAlimentoDto } from './dto/create-alimento.dto.js';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';
import { MenuDistribucion } from './menu-distribucion.entity.js';
import { MenuRacionItem } from './menu-racion-item.entity.js';
import { Escuela } from '../escuelas/escuela.entity.js';
import { Usuario } from '../users/usuario.entity.js';
import { UsuarioEscuela } from '../escuelas/usuario-escuela.entity.js';
import { CreateMenuDocumentDto, DistributeMenuDto } from './dto/create-menu-document.dto.js';
import { CreateMenuRacionItemDto } from './dto/create-menu-racion-item.dto.js';

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
    @InjectRepository(MenuDistribucion)
    private readonly distribucionRepo: Repository<MenuDistribucion>,
    @InjectRepository(MenuRacionItem)
    private readonly racionRepo: Repository<MenuRacionItem>,
    @InjectRepository(Escuela)
    private readonly escuelaRepo: Repository<Escuela>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioEscuela)
    private readonly usuarioEscuelaRepo: Repository<UsuarioEscuela>,
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
    return this.menuRepo.find({
      relations: { distribuciones: { escuela: true } },
      order: { creadoEn: 'DESC' },
    });
  }

  async findVisibleForUser(usuarioId: string, rol: string) {
    if (rol === 'tecnico_mineduc') return this.findAll();
    const asignaciones = await this.usuarioEscuelaRepo.find({
      where: { usuario: { id: usuarioId }, activo: true },
      relations: { escuela: true },
    });
    const escuelaIds = [...new Set(asignaciones.map(asignacion => asignacion.escuela.id))];
    if (!escuelaIds.length) return [];
    const distribuciones = await this.distribucionRepo.find({
      where: {
        escuela: { id: In(escuelaIds) },
        menu: { estado: In([EstadoMenu.PUBLICADO, EstadoMenu.VIGENTE]) } as any,
      },
      relations: { menu: true, escuela: true },
      order: { distribuidoEn: 'DESC' },
    });
    const menus = new Map<string, any>();
    for (const distribucion of distribuciones) {
      const menu = menus.get(distribucion.menu.id) ?? { ...distribucion.menu, distribuciones: [] };
      menu.distribuciones.push({ escuela: distribucion.escuela, distribuidoEn: distribucion.distribuidoEn });
      menus.set(distribucion.menu.id, menu);
    }
    return [...menus.values()];
  }

  async findVisibleById(id: string, usuarioId: string, rol: string) {
    const menu = await this.findById(id);
    if (rol === 'tecnico_mineduc') return menu;
    const schoolAssignments = await this.usuarioEscuelaRepo.find({
      where: { usuario: { id: usuarioId }, activo: true },
      select: { escuela: { id: true } },
    });
    const escuelaIds = schoolAssignments.map(asignacion => asignacion.escuela?.id).filter((value): value is string => Boolean(value));
    if (!escuelaIds.length) throw new NotFoundException('El menú no está distribuido a una escuela asignada a este usuario');
    const distribucion = await this.distribucionRepo.findOne({
      where: { menu: { id }, escuela: { id: In(escuelaIds) } },
    });
    if (!distribucion || ![EstadoMenu.PUBLICADO, EstadoMenu.VIGENTE].includes(menu.estado)) {
      throw new NotFoundException('El menú no está disponible para las escuelas asignadas a este usuario');
    }
    return menu;
  }

  async crearDesdeDocumento(dto: CreateMenuDocumentDto, file: Express.Multer.File, usuarioId: string) {
    if (!file || !file.path) throw new BadRequestException('Debes adjuntar un documento PDF');
    const header = await readFile(file.path, { flag: 'r' });
    if (header.subarray(0, 5).toString() !== '%PDF-') {
      throw new BadRequestException('El archivo no contiene una cabecera PDF válida');
    }

    const tecnico = await this.tecnicoRepo.findOne({ where: { usuario: { id: usuarioId } } });
    if (!tecnico) throw new NotFoundException('No existe un técnico asociado a este usuario');

    const menu = this.menuRepo.create({
      ...dto,
      tecnico: { id: tecnico.id } as any,
      documentoPath: file.path,
      documentoNombre: file.originalname,
      documentoMimeType: 'application/pdf',
      documentoTamanoBytes: file.size,
      estado: EstadoMenu.BORRADOR,
    });
    return this.menuRepo.save(menu);
  }

  async getDocumento(id: string, usuarioId: string, rol: string): Promise<MenuOficial> {
    const menu = await this.findVisibleById(id, usuarioId, rol);
    if (!menu.documentoPath) throw new NotFoundException('Este menú no tiene un documento adjunto');
    return menu;
  }

  async distribuir(id: string, dto: DistributeMenuDto, usuarioId: string) {
    const menu = await this.findById(id);
    if (menu.estado !== EstadoMenu.PUBLICADO && menu.estado !== EstadoMenu.VIGENTE) {
      throw new BadRequestException('Publica el menú antes de distribuirlo');
    }
    const escuelas = await this.escuelaRepo.find({ where: { id: In(dto.escuelaIds), activa: true } });
    if (escuelas.length !== new Set(dto.escuelaIds).size) {
      throw new NotFoundException('Una o más escuelas no existen');
    }
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario autenticado no encontrado');

    const existentes = await this.distribucionRepo.find({ where: { menu: { id } } });
    const idsExistentes = new Set(existentes.map(item => item.escuela.id));
    const nuevas = escuelas.filter(escuela => !idsExistentes.has(escuela.id));
    if (nuevas.length) {
      await this.distribucionRepo.save(nuevas.map(escuela => this.distribucionRepo.create({
        menu: { id } as any,
        escuela,
        distribuidoPor: usuario,
      })));
    }
    return { ok: true, mensaje: 'Menú distribuido a las escuelas seleccionadas', data: { distribuidas: nuevas.length } };
  }

  async getDistribuidosPorEscuela(escuelaId: string, usuarioId: string, rol: string) {
    if (rol !== 'tecnico_mineduc') {
      const asignacion = await this.usuarioEscuelaRepo.findOne({
        where: { escuela: { id: escuelaId }, usuario: { id: usuarioId }, activo: true },
      });
      if (!asignacion) throw new NotFoundException('No tienes acceso a esta escuela');
    }
    return this.distribucionRepo.find({
      where: {
        escuela: { id: escuelaId },
        menu: { estado: In([EstadoMenu.PUBLICADO, EstadoMenu.VIGENTE]) } as any,
      },
      relations: { menu: true },
      order: { distribuidoEn: 'DESC' },
    });
  }

  async reemplazarItemsRacion(menuId: string, items: CreateMenuRacionItemDto[]) {
    const menu = await this.findById(menuId);
    if (menu.estado !== EstadoMenu.BORRADOR) {
      throw new BadRequestException('Sólo se pueden editar opciones de ración mientras el menú está en borrador');
    }
    await this.racionRepo.delete({ menu: { id: menuId } as any });
    if (!items.length) return { ok: true, mensaje: 'Se eliminaron las opciones de ración' };
    const registros = items.map(item => this.racionRepo.create({ ...item, menu: { id: menuId } as any }));
    await this.racionRepo.save(registros);
    return { ok: true, mensaje: 'Opciones oficiales guardadas', data: { cantidad: registros.length } };
  }

  async sugerirItemsPlan(menuId: string, opcionCodigo: string, grupoBeneficiario: string, estudiantes: number, usuarioId: string, rol: string) {
    if (!Number.isInteger(estudiantes) || estudiantes < 1) {
      throw new BadRequestException('La cantidad de estudiantes debe ser un entero mayor que cero');
    }
    const menu = await this.findVisibleById(menuId, usuarioId, rol);
    const items = await this.racionRepo.find({ where: { menu: { id: menuId }, opcionCodigo, grupoBeneficiario } });
    if (!items.length) throw new NotFoundException('No hay renglones capturados para esa opción y grupo');
    const alimentoIds = [...new Set(items.map(item => item.alimentoId).filter((id): id is string => Boolean(id)))];
    const alimentos = alimentoIds.length
      ? await this.alimentoRepo.find({ where: { id: In(alimentoIds) } })
      : [];
    const alimentosPorId = new Map(alimentos.map(alimento => [alimento.id, alimento]));
    return {
      menuId,
      menu: menu.nombre,
      opcionCodigo,
      grupoBeneficiario,
      estudiantes,
      nota: 'Sugerencia matemática basada únicamente en las cantidades transcritas del documento; revisar contra el PDF antes de comprar. Los precios son manuales y no son una cotización oficial.',
      items: items.map(item => {
        const alimento = item.alimentoId ? alimentosPorId.get(item.alimentoId) : undefined;
        return {
        alimentoId: item.alimentoId,
        alimentoNombre: item.alimentoNombre,
        presentacion: item.presentacion,
        cantidadPorBeneficiario: Number(item.cantidad),
        unidad: item.unidad,
        cantidadTotal: Number((Number(item.cantidad) * estudiantes).toFixed(3)),
        origenCompra: item.origenCompra,
        grupoNutriente: item.grupoNutriente,
        tipoCompra: alimento?.tipoCompra ?? 'por_definir',
        origenCompraCatalogo: alimento?.origenCompra ?? 'por_definir',
        precioReferenciaQ: alimento?.precioRefQ == null ? null : Number(alimento.precioRefQ),
        fuentePrecio: alimento?.precioRefFuente ?? null,
        fechaPrecio: alimento?.precioRefFecha ?? null,
        zonaPrecio: alimento?.precioRefZona ?? null,
        alertaPrecio: alimento?.precioRefQ == null
          ? 'Precio no definido; confirmar precio local antes de presupuestar.'
          : 'Precio de referencia manual; validar vigencia y proveedor.',
        };
      }),
    };
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