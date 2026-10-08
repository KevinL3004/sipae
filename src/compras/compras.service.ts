import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { AsignacionPresupuesto, EstadoAsignacion } from './asignacion-presupuesto.entity.js';
import { Proveedor } from './proveedor.entity.js';
import { PlanCompra, EstadoPlan } from './plan-compra.entity.js';
import { ItemPlanCompra } from './item-plan-compra.entity.js';
import { CompraRealizada, EstadoCompra } from './compra-realizada.entity.js';
import { ItemCompra } from './item-compra.entity.js';
import { CreateAsignacionDto } from './dto/create-asignacion.dto.js';
import { CreateProveedorDto } from './dto/create-proveedor.dto.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { CreateCompraDto } from './dto/create-compra.dto.js';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';
import type { Express } from 'express';

@Injectable()
export class ComprasService {
    constructor(
        @InjectRepository(AsignacionPresupuesto)
        private readonly asigRepo: Repository<AsignacionPresupuesto>,
        @InjectRepository(Proveedor)
        private readonly provRepo: Repository<Proveedor>,
        @InjectRepository(PlanCompra)
        private readonly planRepo: Repository<PlanCompra>,
        @InjectRepository(ItemPlanCompra)
        private readonly itemPlanRepo: Repository<ItemPlanCompra>,
        @InjectRepository(CompraRealizada)
        private readonly compraRepo: Repository<CompraRealizada>,
        @InjectRepository(ItemCompra)
        private readonly itemCompraRepo: Repository<ItemCompra>,
        @InjectRepository(TecnicoMineduc)
        private readonly tecnicoRepo: Repository<TecnicoMineduc>,
    ) { }

    // ── Asignaciones ─────────────────────────────────────────
    async getAsignaciones(escuelaId: string) {
        return this.asigRepo.find({
            where: { escuela: { id: escuelaId } },
            order: { asignadoEn: 'DESC' },
        });
    }

    async getAsignacionActiva(escuelaId: string) {
        return this.asigRepo.findOne({
            where: { escuela: { id: escuelaId }, estado: EstadoAsignacion.ACTIVA },
        });
    }

    async crearAsignacion(dto: CreateAsignacionDto, usuarioId: string) {
        const tecnico = await this.tecnicoRepo.findOne({
            where: { usuario: { id: usuarioId } },
        });

        if (!tecnico) {
            throw new NotFoundException('No existe un técnico asociado a este usuario');
        }

        const asig = this.asigRepo.create({
            escuela: { id: dto.escuelaId } as any,
            menu: { id: dto.menuId } as any,
            tecnico: { id: tecnico.id } as any,
            montoTotalQ: dto.montoTotalQ,
            periodoInicio: dto.periodoInicio,
            periodoFin: dto.periodoFin,
            notas: dto.notas,
            estado: EstadoAsignacion.ACTIVA,
        });
        return this.asigRepo.save(asig);
    }

    async cerrarAsignacion(id: string) {
        await this.asigRepo.update(id, { estado: EstadoAsignacion.CERRADA });
        return { ok: true, mensaje: 'Asignación cerrada correctamente' };
    }

    // ── Proveedores ───────────────────────────────────────────
    async getProveedores(escuelaId: string) {
        return this.provRepo.find({
            where: { escuela: { id: escuelaId }, activo: true },
            order: { nombre: 'ASC' },
        });
    }

    async crearProveedor(dto: CreateProveedorDto) {
        const prov = this.provRepo.create({
            ...dto,
            escuela: { id: dto.escuelaId } as any,
        });
        return this.provRepo.save(prov);
    }

    async toggleProveedor(id: string) {
        const prov = await this.provRepo.findOne({ where: { id } });
        if (!prov) throw new NotFoundException('Proveedor no encontrado');
        await this.provRepo.update(id, { activo: !prov.activo });
        return { ok: true, activo: !prov.activo };
    }

    // ── Planes de compra ──────────────────────────────────────
    async getPlanes(escuelaId: string) {
        return this.planRepo.find({
            where: { escuela: { id: escuelaId } },
            order: { generadoEn: 'DESC' },
        });
    }

    async getPlanById(id: string) {
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan) throw new NotFoundException('Plan de compra no encontrado');
        return plan;
    }

    async crearPlan(dto: CreatePlanDto, usuarioId: string) {
        const plan = this.planRepo.create({
            escuela: { id: dto.escuelaId } as any,
            asignacion: { id: dto.asignacionId } as any,
            usuario: { id: usuarioId } as any,
            semanaInicio: dto.semanaInicio,
            semanaFin: dto.semanaFin,
            numEstudiantes: dto.numEstudiantes,
        });

        if (dto.items?.length) {
            const items: ItemPlanCompra[] = dto.items.map((i): ItemPlanCompra => {
                const item = this.itemPlanRepo.create({
                    alimento: { id: i.alimentoId } as any,
                    cantidadAComprar: i.cantidadAComprar,
                    unidad: i.unidad,
                    precioUnitarioQ: i.precioUnitarioQ && i.precioUnitarioQ > 0 ? i.precioUnitarioQ : undefined,
                    frecuenciaCompra: i.frecuenciaCompra ?? 'por_definir',
                    fechaCompraSugerida: i.fechaCompraSugerida,
                    observacionSugerencia: i.observacionSugerencia,
                } as any);
                return item as unknown as ItemPlanCompra;
            });

            plan.items = items;

            const total = dto.items.reduce((sum, item) => {
                const subtotal = item.precioUnitarioQ === undefined
                    ? 0
                    : Math.round(item.cantidadAComprar * item.precioUnitarioQ * 100) / 100;
                return sum + subtotal;
            }, 0);
            plan.costoEstimadoQ = total;
            plan.estado = EstadoPlan.OPTIMIZADO;
            plan.notasOptimizacion = `Plan generado con ${plan.items.length} productos. Costo total estimado: Q ${total.toFixed(2)}`;
        }

        return this.planRepo.save(plan);
    }

    async aprobarPlan(id: string) {
        await this.getPlanById(id);
        await this.planRepo.update(id, { estado: EstadoPlan.APROBADO });
        return { ok: true, mensaje: 'Plan aprobado correctamente' };
    }

    // ── Compras realizadas ────────────────────────────────────
    async getCompras(escuelaId: string) {
        return this.compraRepo.find({
            where: { plan: { escuela: { id: escuelaId } } },
            order: { registradoEn: 'DESC' },
        });
    }

    async registrarCompra(dto: CreateCompraDto, usuarioId: string) {
        const compra = this.compraRepo.create({
            plan: { id: dto.planId } as any,
            proveedor: dto.proveedorId ? { id: dto.proveedorId } as any : null,
            usuario: { id: usuarioId } as any,
            fechaCompra: dto.fechaCompra,
            totalGastadoQ: dto.totalGastadoQ,
            numeroFactura: dto.numeroFactura,
            observaciones: dto.observaciones,
            items: dto.items.map((i) =>
                this.itemCompraRepo.create({
                    alimento: { id: i.alimentoId } as any,
                    cantidadComprada: i.cantidadComprada,
                    unidad: i.unidad,
                    precioUnitarioQ: i.precioUnitarioQ,
                }),
            ),
        });
        return this.compraRepo.save(compra);
    }

    async cargarFactura(id: string, file: Express.Multer.File) {
        if (!file?.path) throw new BadRequestException('Debes adjuntar una factura PDF o imagen');
        const compra = await this.compraRepo.findOne({ where: { id } });
        if (!compra) throw new NotFoundException('Compra no encontrada');
        if (compra.estado !== EstadoCompra.REGISTRADA) {
            throw new BadRequestException('Sólo se pueden adjuntar facturas a compras pendientes de revisión');
        }
        const facturaAnterior = compra.imagenFactura;
        compra.imagenFactura = file.path;
        compra.facturaNombreOriginal = file.originalname;
        compra.facturaMimeType = file.mimetype;
        compra.facturaTamanoBytes = file.size;
        const guardada = await this.compraRepo.save(compra);
        if (facturaAnterior && facturaAnterior !== file.path) {
            await unlink(facturaAnterior).catch(() => undefined);
        }
        return guardada;
    }

    async getFactura(id: string): Promise<CompraRealizada> {
        const compra = await this.compraRepo.findOne({ where: { id } });
        if (!compra) throw new NotFoundException('Compra no encontrada');
        if (!compra.imagenFactura) throw new NotFoundException('La compra no tiene factura adjunta');
        return compra;
    }

    async getConciliacion(id: string) {
        const compra = await this.compraRepo.findOne({
            where: { id },
            relations: { plan: { items: { alimento: true } }, items: { alimento: true } },
        });
        if (!compra) throw new NotFoundException('Compra no encontrada');

        const planned = new Map<string, ItemPlanCompra>();
        for (const item of compra.plan?.items ?? []) planned.set(item.alimento.id, item);
        const actual = new Map<string, ItemCompra>();
        for (const item of compra.items ?? []) actual.set(item.alimento.id, item);

        const alimentoIds = new Set([...planned.keys(), ...actual.keys()]);
        const partidas = [...alimentoIds].map(alimentoId => {
            const planItem = planned.get(alimentoId);
            const actualItem = actual.get(alimentoId);
            const cantidadPlaneada = Number(planItem?.cantidadAComprar ?? 0);
            const cantidadComprada = Number(actualItem?.cantidadComprada ?? 0);
            const subtotalPlaneado = planItem?.precioUnitarioQ == null
                ? null
                : Math.round(cantidadPlaneada * Number(planItem.precioUnitarioQ) * 100) / 100;
            const subtotalReal = actualItem
                ? Math.round(cantidadComprada * Number(actualItem.precioUnitarioQ) * 100) / 100
                : 0;
            return {
                alimentoId,
                alimento: actualItem?.alimento?.nombre ?? planItem?.alimento?.nombre ?? 'Alimento',
                cantidadPlaneada,
                cantidadComprada,
                diferenciaCantidad: Math.round((cantidadComprada - cantidadPlaneada) * 1000) / 1000,
                subtotalPlaneado,
                subtotalReal,
                diferenciaCosto: subtotalPlaneado == null ? null : Math.round((subtotalReal - subtotalPlaneado) * 100) / 100,
                estado: !planItem ? 'no_planificado' : !actualItem ? 'no_comprado' : cantidadComprada === cantidadPlaneada ? 'coincide' : 'diferencia',
            };
        });
        const tieneDiferencias = partidas.some(partida => partida.estado !== 'coincide');
        const comprasTotal = Math.round(partidas.reduce((total, partida) => total + partida.subtotalReal, 0) * 100) / 100;

        return {
            ok: true,
            mensaje: 'Conciliación calculada; requiere revisión humana y no constituye aprobación automática',
            data: {
                compraId: compra.id,
                estadoCompra: compra.estado,
                facturaAdjunta: Boolean(compra.imagenFactura),
                totalDeclarado: Number(compra.totalGastadoQ),
                totalCalculadoPartidas: comprasTotal,
                diferenciaTotalDeclarado: Math.round((Number(compra.totalGastadoQ) - comprasTotal) * 100) / 100,
                montoPresupuestado: Number(compra.plan?.costoEstimadoQ ?? 0),
                diferenciaVsPresupuesto: Math.round((Number(compra.totalGastadoQ) - Number(compra.plan?.costoEstimadoQ ?? 0)) * 100) / 100,
                tieneDiferencias,
                partidas,
            },
        };
    }

    async verificarCompra(id: string) {
        const compra = await this.compraRepo.findOne({ where: { id } });
        if (!compra) throw new NotFoundException('Compra no encontrada');
        if (!compra.imagenFactura) {
            throw new BadRequestException('Adjunta la factura antes de verificar la compra');
        }
        const totalPartidas = Math.round((compra.items ?? []).reduce(
            (total, item) => total + Number(item.cantidadComprada) * Number(item.precioUnitarioQ),
            0,
        ) * 100) / 100;
        if (Math.abs(totalPartidas - Number(compra.totalGastadoQ)) > 0.01) {
            throw new BadRequestException('El total de las partidas no coincide con el total declarado; revisa la conciliación');
        }
        await this.compraRepo.update(id, { estado: EstadoCompra.VERIFICADA });
        return { ok: true, mensaje: 'Compra verificada correctamente' };
    }

    async rechazarCompra(id: string) {
        const compra = await this.compraRepo.findOne({ where: { id } });
        if (!compra) throw new NotFoundException('Compra no encontrada');
        await this.compraRepo.update(id, { estado: EstadoCompra.RECHAZADA });
        return { ok: true, mensaje: 'Compra rechazada' };
    }

    // ── Resumen presupuestario ────────────────────────────────
    async getResumenPresupuestario(escuelaId: string) {
        const asig = await this.getAsignacionActiva(escuelaId);
        if (!asig) return { ok: false, mensaje: 'No hay asignación activa' };

        const compras = await this.compraRepo.find({
            where: {
                plan: { asignacion: { id: asig.id } },
                estado: EstadoCompra.VERIFICADA,
            },
        });

        const gastado = compras.reduce((s, c) => s + Number(c.totalGastadoQ), 0);
        const saldo = Number(asig.montoTotalQ) - gastado;

        return {
            ok: true,
            data: {
                asignado: Number(asig.montoTotalQ),
                gastado: Math.round(gastado * 100) / 100,
                saldo: Math.round(saldo * 100) / 100,
                porcentaje_ejecutado: Math.round((gastado / Number(asig.montoTotalQ)) * 100 * 10) / 10,
                periodo_inicio: asig.periodoInicio,
                periodo_fin: asig.periodoFin,
            },
        };
    }
}