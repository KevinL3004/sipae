import {
  Entity, PrimaryGeneratedColumn, Column,
  UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Escuela } from '../escuelas/escuela.entity.js';
import { Alimento } from '../menus/alimento.entity.js';

@Entity('inventario')
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Escuela, { eager: true })
  @JoinColumn({ name: 'escuela_id' })
  escuela: Escuela;

  @ManyToOne(() => Alimento, { eager: true })
  @JoinColumn({ name: 'alimento_id' })
  alimento: Alimento;

  @Column({ name: 'existencia_actual', type: 'numeric', precision: 10, scale: 3, default: 0 })
  existenciaActual: number;

  @Column({ name: 'stock_minimo', type: 'numeric', precision: 10, scale: 3, default: 0 })
  stockMinimo: number;

  @UpdateDateColumn({ name: 'ultima_actualizacion', type: 'timestamptz' })
  ultimaActualizacion: Date;
}