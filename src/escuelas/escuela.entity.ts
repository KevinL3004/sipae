import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { TecnicoMineduc } from './tecnico-mineduc.entity.js';

@Entity('escuelas')
export class Escuela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'codigo_mineduc', unique: true, length: 30 })
  codigoMineduc: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 100 })
  municipio: string;

  @Column({ length: 80 })
  departamento: string;

  @Column({ nullable: true, type: 'text' })
  direccion: string;

  @Column({ name: 'matricula_actual', default: 0 })
  matriculaActual: number;

  @ManyToOne(() => TecnicoMineduc, { nullable: true, eager: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: TecnicoMineduc;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}