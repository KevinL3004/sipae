import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { TecnicoMineduc } from '../escuelas/tecnico-mineduc.entity.js';
import type { DiaMenu } from './dia-menu.entity.js';
import type { MenuDistribucion } from './menu-distribucion.entity.js';
import type { MenuRacionItem } from './menu-racion-item.entity.js';

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

  @Column({ name: 'nivel_educativo', nullable: true, length: 40 })
  nivelEducativo: string;

  @Column({ nullable: true, length: 100 })
  departamento: string;

  @Column({ name: 'grupo_beneficiario', nullable: true, length: 120 })
  grupoBeneficiario: string;

  @Column({ name: 'numero_entrega', nullable: true, length: 80 })
  numeroEntrega: string;

  @Column({ name: 'dias_cobertura', type: 'smallint', nullable: true })
  diasCobertura: number;

  @Column({ name: 'monto_diario_alumno_q', type: 'numeric', precision: 8, scale: 2, nullable: true })
  montoDiarioAlumnoQ: number;

  @Column({ name: 'documento_path', nullable: true, type: 'text' })
  documentoPath: string;

  @Column({ name: 'documento_nombre', nullable: true, length: 255 })
  documentoNombre: string;

  @Column({ name: 'documento_mime_type', nullable: true, length: 100 })
  documentoMimeType: string;

  @Column({ name: 'documento_tamano_bytes', type: 'bigint', nullable: true })
  documentoTamanoBytes: number;

  @OneToMany('DiaMenu', 'menu', { cascade: true, eager: true })
  dias: DiaMenu[];

  @OneToMany('MenuDistribucion', 'menu')
  distribuciones: MenuDistribucion[];

  @OneToMany('MenuRacionItem', 'menu', { cascade: true, eager: true })
  itemsRacion: MenuRacionItem[];

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}