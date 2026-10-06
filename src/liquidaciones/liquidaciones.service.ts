import {
    Injectable, NotFoundException, BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Liquidacion, EstadoLiquidacion } from './liquidacion.entity.js';
import { CreateLiquidacionDto } from './dto/create-liquidacion.dto.js';
import { AsignacionPresupuesto } from '../compras/asignacion-presupuesto.entity.js';
import { CompraRealizada, EstadoCompra } from '../compras/compra-realizada.entity.js';

@Injectable()
export class LiquidacionesService {
    constructor(
        @InjectRepository(Liquidacion)
        private readonly liqRepo: Repository<Liquidacion>,
        @InjectRepository(AsignacionPresupuesto)
        private readonly asigRepo: Repository<AsignacionPresupuesto>,
        @InjectRepository(CompraRealizada)
        private readonly compraRepo: Repository<CompraRealizada>,
    ) { }

    async getByEscuela(escuelaId: string) {
        return this.liqRepo.find({
            where: { escuela: { id: escuelaId } },
            order: { generadoEn: 'DESC' },
        });
    }

    async getById(id: string) {
        const liq = await this.liqRepo.findOne({ where: { id } });
        if (!liq) throw new NotFoundException('Liquidación no encontrada');
        return liq;
    }

    async generar(dto: CreateLiquidacionDto, usuarioId: string) {
        // Verificar que no exista ya una liquidación para esta asignación
        const existe = await this.liqRepo.findOne({
            where: { asignacion: { id: dto.asignacionId } },
        });
        if (existe) throw new BadRequestException('Ya existe una liquidación para esta asignación');

        const asig = await this.asigRepo.findOne({ where: { id: dto.asignacionId } });
        if (!asig) throw new NotFoundException('Asignación no encontrada');

        // Calcular total gastado de compras verificadas
        const compras = await this.compraRepo.find({
            where: {
                plan: { asignacion: { id: dto.asignacionId } },
                estado: EstadoCompra.VERIFICADA,
            },
        });

        const totalGastado = compras.reduce((s, c) => s + Number(c.totalGastadoQ), 0);

        const liq = this.liqRepo.create({
            escuela: { id: dto.escuelaId } as any,
            asignacion: { id: dto.asignacionId } as any,
            generadoPor: { id: usuarioId } as any,
            periodoInicio: asig.periodoInicio,
            periodoFin: asig.periodoFin,
            totalAsignadoQ: Number(asig.montoTotalQ),
            totalGastadoQ: Math.round(totalGastado * 100) / 100,
            observaciones: dto.observaciones,
        });

        return this.liqRepo.save(liq);
    }

    async enviar(id: string) {
        const liq = await this.getById(id);
        if (liq.estado !== EstadoLiquidacion.BORRADOR)
            throw new BadRequestException('Solo se pueden enviar liquidaciones en borrador');

        await this.liqRepo.update(id, {
            estado: EstadoLiquidacion.ENVIADA,
            enviadoEn: new Date(),
        });
        return { ok: true, mensaje: 'Liquidación enviada al MINEDUC' };
    }

    async aprobar(id: string) {
        await this.getById(id);
        await this.liqRepo.update(id, { estado: EstadoLiquidacion.APROBADA });
        return { ok: true, mensaje: 'Liquidación aprobada' };
    }

    async observar(id: string, observaciones: string) {
        await this.getById(id);
        await this.liqRepo.update(id, {
            estado: EstadoLiquidacion.OBSERVADA,
            observaciones,
        });
        return { ok: true, mensaje: 'Liquidación marcada como observada' };
    }

    async getResumenTecnico(tecnicoId: string) {
        const liquidaciones = await this.liqRepo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.escuela', 'e')
            .leftJoinAndSelect('e.tecnico', 't')
            .where('t.id = :tecnicoId', { tecnicoId })
            .orderBy('l.generadoEn', 'DESC')
            .getMany();

        const total = liquidaciones.length;
        const enviadas = liquidaciones.filter(l => l.estado === EstadoLiquidacion.ENVIADA).length;
        const aprobadas = liquidaciones.filter(l => l.estado === EstadoLiquidacion.APROBADA).length;
        const observadas = liquidaciones.filter(l => l.estado === EstadoLiquidacion.OBSERVADA).length;
        const borradores = liquidaciones.filter(l => l.estado === EstadoLiquidacion.BORRADOR).length;

        return {
            ok: true,
            data: {
                resumen: { total, enviadas, aprobadas, observadas, borradores },
                liquidaciones,
            },
        };
    }
}