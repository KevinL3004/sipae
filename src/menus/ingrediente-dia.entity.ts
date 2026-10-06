import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import type { DiaMenu } from './dia-menu.entity.js';
import { Alimento } from './alimento.entity.js';

@Entity('ingredientes_dia')
export class IngredienteDia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('DiaMenu', 'ingredientes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dia_menu_id' })
  diaMenu: DiaMenu;

  @ManyToOne(() => Alimento, { eager: true })
  @JoinColumn({ name: 'alimento_id' })
  alimento: Alimento;

  @Column({ name: 'cantidad_por_estudiante_g', type: 'numeric', precision: 8, scale: 3 })
  cantidadPorEstudianteG: number;

  @Column({ length: 20, default: 'g' })
  unidad: string;
}