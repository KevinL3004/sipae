import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Escuela } from '../escuelas/escuela.entity.js';
import { AsignacionPresupuesto } from '../compras/asignacion-presupuesto.entity.js';
import { Usuario } from '../users/usuario.entity.js';

export enum EstadoLiquidacion {
    BORRADOR = 'borrador',
    ENVIADA = 'enviada',
    APROBADA = 'aprobada',
    OBSERVADA = 'observada',
}

@Entity('liquidaciones')
export class Liquidacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Escuela, { eager: true })
    @JoinColumn({ name: 'escuela_id' })
    escuela: Escuela;

    @ManyToOne(() => AsignacionPresupuesto, { eager: true })
    @JoinColumn({ name: 'asignacion_id' })
    asignacion: AsignacionPresupuesto;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'generado_por' })
    generadoPor: Usuario;

    @Column({ name: 'periodo_inicio', type: 'date' })
    periodoInicio: string;

    @Column({ name: 'periodo_fin', type: 'date' })
    periodoFin: string;

    @Column({ name: 'total_asignado_q', type: 'numeric', precision: 12, scale: 2 })
    totalAsignadoQ: number;

    @Column({ name: 'total_gastado_q', type: 'numeric', precision: 12, scale: 2, default: 0 })
    totalGastadoQ: number;

    @Column({
        name: 'saldo_q', type: 'numeric', precision: 12, scale: 2, generatedType: 'STORED',
        asExpression: `ROUND(total_asignado_q - total_gastado_q, 2)`
    })
    saldoQ: number;

    @Column({ type: 'enum', enum: EstadoLiquidacion, default: EstadoLiquidacion.BORRADOR })
    estado: EstadoLiquidacion;

    @Column({ name: 'url_pdf', nullable: true, type: 'text' })
    urlPdf: string;

    @Column({ nullable: true, type: 'text' })
    observaciones: string;

    @CreateDateColumn({ name: 'generado_en', type: 'timestamptz' })
    generadoEn: Date;

    @Column({ name: 'enviado_en', nullable: true, type: 'timestamptz' })
    enviadoEn: Date;
}