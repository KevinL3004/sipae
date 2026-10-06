import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum GrupoAlimentario {
  LEGUMINOSAS   = 'leguminosas',
  CEREALES      = 'cereales',
  LACTEOS       = 'lacteos',
  CARNES        = 'carnes',
  FRUTAS        = 'frutas',
  VERDURAS      = 'verduras',
  GRASAS        = 'grasas_aceites',
  BEBIDAS       = 'bebidas',
  OTROS         = 'otros',
}

@Entity('alimentos')
export class Alimento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150, unique: true })
  nombre: string;

  @Column({ type: 'enum', enum: GrupoAlimentario })
  grupo: GrupoAlimentario;

  @Column({ name: 'kcal_por_100g', type: 'numeric', precision: 8, scale: 2 })
  kcalPor100g: number;

  @Column({ name: 'proteina_g', type: 'numeric', precision: 7, scale: 2, default: 0 })
  proteinaG: number;

  @Column({ name: 'carbohidratos_g', type: 'numeric', precision: 7, scale: 2, default: 0 })
  carbohidratosG: number;

  @Column({ name: 'grasas_g', type: 'numeric', precision: 7, scale: 2, default: 0 })
  grasasG: number;

  @Column({ name: 'precio_ref_q', type: 'numeric', precision: 8, scale: 2, nullable: true })
  precioRefQ: number;

  @Column({ name: 'unidad_inventario', length: 20, default: 'lb' })
  unidadInventario: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'fuente_nutricional', length: 100, default: 'INCAP 2021' })
  fuenteNutricional: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}