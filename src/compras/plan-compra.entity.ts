import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { Escuela } from '../escuelas/escuela.entity.js';
import { AsignacionPresupuesto } from './asignacion-presupuesto.entity.js';
import { Usuario } from '../users/usuario.entity.js';
import type { ItemPlanCompra } from './item-plan-compra.entity.js';

export enum EstadoPlan {
    BORRADOR = 'borrador',
    OPTIMIZADO = 'optimizado',
    APROBADO = 'aprobado',
    EJECUTADO = 'ejecutado',
}

@Entity('planes_compra')
export class PlanCompra {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Escuela, { eager: true })
    @JoinColumn({ name: 'escuela_id' })
    escuela: Escuela;

    @ManyToOne(() => AsignacionPresupuesto, { eager: true })
    @JoinColumn({ name: 'asignacion_id' })
    asignacion: AsignacionPresupuesto;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ name: 'semana_inicio', type: 'date' })
    semanaInicio: string;

    @Column({ name: 'semana_fin', type: 'date' })
    semanaFin: string;

    @Column({ name: 'num_estudiantes' })
    numEstudiantes: number;

    @Column({ name: 'costo_estimado_q', type: 'numeric', precision: 12, scale: 2, nullable: true })
    costoEstimadoQ: number;

    @Column({ type: 'enum', enum: EstadoPlan, default: EstadoPlan.BORRADOR })
    estado: EstadoPlan;

    @Column({ name: 'notas_optimizacion', nullable: true, type: 'text' })
    notasOptimizacion: string;

    @OneToMany('ItemPlanCompra', 'plan', { cascade: true, eager: true })
    items: ItemPlanCompra[];

    @CreateDateColumn({ name: 'generado_en', type: 'timestamptz' })
    generadoEn: Date;

    @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
    actualizadoEn: Date;
}