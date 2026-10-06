import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
                    precioUnitarioQ: i.precioUnitarioQ,
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

    async verificarCompra(id: string) {
        const compra = await this.compraRepo.findOne({ where: { id } });
        if (!compra) throw new NotFoundException('Compra no encontrada');
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