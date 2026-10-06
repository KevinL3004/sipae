import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Inventario } from './inventario.entity.js';
import { Usuario } from '../users/usuario.entity.js';

export enum TipoMovimiento {
  INGRESO = 'ingreso',
  SALIDA  = 'salida',
}

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventario, { eager: true })
  @JoinColumn({ name: 'inventario_id' })
  inventario: Inventario;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo: TipoMovimiento;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  cantidad: number;

  @Column({ nullable: true, length: 200 })
  motivo: string;

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @CreateDateColumn({ name: 'registrado_en', type: 'timestamptz' })
  registradoEn: Date;
}