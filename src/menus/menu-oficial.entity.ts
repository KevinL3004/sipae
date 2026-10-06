import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';
import type { DiaMenu } from './dia-menu.entity.js';

export enum EstadoMenu {
  BORRADOR   = 'borrador',
  PUBLICADO  = 'publicado',
  VIGENTE    = 'vigente',
  VENCIDO    = 'vencido',
}

@Entity('menus_oficiales')
export class MenuOficial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TecnicoMineduc, { eager: false })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: TecnicoMineduc;

  @Column({ length: 200 })
  nombre: string;

  @Column({ nullable: true, type: 'text' })
  descripcion: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: string;

  @Column({ type: 'enum', enum: EstadoMenu, default: EstadoMenu.BORRADOR })
  estado: EstadoMenu;

  @OneToMany('DiaMenu', 'menu', { cascade: true, eager: true })
  dias: DiaMenu[];

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}