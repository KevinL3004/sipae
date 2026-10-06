import {
    Injectable, NotFoundException, BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventario } from './inventario.entity.js';
import { MovimientoInventario, TipoMovimiento } from './movimiento-inventario.entity.js';
import { CreateMovimientoDto } from './dto/create-movimiento.dto.js';
import { UpdateStockMinimoDto } from './dto/update-stock-minimo.dto.js';

@Injectable()
export class InventarioService {
    constructor(
        @InjectRepository(Inventario)
        private readonly invRepo: Repository<Inventario>,
        @InjectRepository(MovimientoInventario)
        private readonly movRepo: Repository<MovimientoInventario>,
    ) { }

    async getByEscuela(escuelaId: string) {
        return this.invRepo.find({
            where: { escuela: { id: escuelaId } },
            order: { alimento: { nombre: 'ASC' } } as any,
        });
    }

    async getAlertas(escuelaId: string) {
        const items = await this.getByEscuela(escuelaId);
        return items.filter((i) => Number(i.existenciaActual) <= Number(i.stockMinimo));
    }

    async registrarMovimiento(dto: CreateMovimientoDto, usuarioId: string) {
        // Buscar o crear registro de inventario
        let inv = await this.invRepo.findOne({
            where: {
                escuela: { id: dto.escuelaId },
                alimento: { id: dto.alimentoId },
            },
        });

        if (!inv) {
            inv = this.invRepo.create({
                escuela: { id: dto.escuelaId } as any,
                alimento: { id: dto.alimentoId } as any,
                existenciaActual: 0,
                stockMinimo: 0,
            });
            inv = await this.invRepo.save(inv);
        }

        // Validar salida
        if (
            dto.tipo === TipoMovimiento.SALIDA &&
            Number(inv.existenciaActual) < dto.cantidad
        ) {
            throw new BadRequestException(
                `Existencia insuficiente. Disponible: ${inv.existenciaActual}`,
            );
        }

        // Registrar movimiento (el trigger de PG actualiza existencias)
        const mov = this.movRepo.create({
            inventario: { id: inv.id } as any,
            usuario: { id: usuarioId } as any,
            tipo: dto.tipo,
            cantidad: dto.cantidad,
            motivo: dto.motivo,
            observaciones: dto.observaciones,
        });
        await this.movRepo.save(mov);

        // Refrescar y retornar estado actualizado
        const updated = await this.invRepo.findOne({ where: { id: inv.id } });
        return {
            ok: true,
            mensaje: `Movimiento de ${dto.tipo} registrado correctamente`,
            data: updated,
        };
    }

    async getMovimientos(escuelaId: string, alimentoId?: string) {
        const where: any = { inventario: { escuela: { id: escuelaId } } };
        if (alimentoId) where.inventario.alimento = { id: alimentoId };
        return this.movRepo.find({
            where,
            order: { registradoEn: 'DESC' },
            take: 100,
        });
    }

    async actualizarStockMinimo(dto: UpdateStockMinimoDto) {
        const inv = await this.invRepo.findOne({
            where: {
                escuela: { id: dto.escuelaId },
                alimento: { id: dto.alimentoId },
            },
        });
        if (!inv) throw new NotFoundException('Registro de inventario no encontrado');
        await this.invRepo.update(inv.id, { stockMinimo: dto.stockMinimo });
        return { ok: true, mensaje: 'Stock mínimo actualizado' };
    }
}