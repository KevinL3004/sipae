import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { MenuOficial } from './menu-oficial.entity.js';
import type { IngredienteDia } from './ingrediente-dia.entity.js';

export enum DiaSemana {
  LUNES     = 'lunes',
  MARTES    = 'martes',
  MIERCOLES = 'miercoles',
  JUEVES    = 'jueves',
  VIERNES   = 'viernes',
}

@Entity('dias_menu')
export class DiaMenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MenuOficial, (m) => m.dias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: MenuOficial;

  @Column({ name: 'semana_numero', type: 'smallint' })
  semanaNumero: number;

  @Column({ type: 'enum', enum: DiaSemana })
  dia: DiaSemana;

  @Column({ name: 'descripcion_refaccion', type: 'text' })
  descripcionRefaccion: string;

  @Column({ name: 'kcal_estimadas', nullable: true })
  kcalEstimadas: number;

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @OneToMany('IngredienteDia', 'diaMenu', { cascade: true, eager: true })
  ingredientes: IngredienteDia[];
}