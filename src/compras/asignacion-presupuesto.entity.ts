import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn
} from 'typeorm';
import { Escuela } from '../escuelas/escuela.entity.js';
import { MenuOficial } from '../menus/menu-oficial.entity.js';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';

export enum EstadoAsignacion {
    PENDIENTE = 'pendiente',
    ACTIVA = 'activa',
    CERRADA = 'cerrada',
    AUDITADA = 'auditada',
}

@Entity('asignaciones_presupuesto')
export class AsignacionPresupuesto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Escuela, { eager: true })
    @JoinColumn({ name: 'escuela_id' })
    escuela: Escuela;

    @ManyToOne(() => MenuOficial, { eager: true })
    @JoinColumn({ name: 'menu_id' })
    menu: MenuOficial;

    @ManyToOne(() => TecnicoMineduc, { eager: false })
    @JoinColumn({ name: 'tecnico_id' })
    tecnico: TecnicoMineduc;

    @Column({ name: 'monto_total_q', type: 'numeric', precision: 12, scale: 2 })
    montoTotalQ: number;

    @Column({ name: 'periodo_inicio', type: 'date' })
    periodoInicio: string;

    @Column({ name: 'periodo_fin', type: 'date' })
    periodoFin: string;

    @Column({ type: 'enum', enum: EstadoAsignacion, default: EstadoAsignacion.PENDIENTE })
    estado: EstadoAsignacion;

    @Column({ nullable: true, type: 'text' })
    notas: string;

    @CreateDateColumn({ name: 'asignado_en', type: 'timestamptz' })
    asignadoEn: Date;

    @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
    actualizadoEn: Date;
}