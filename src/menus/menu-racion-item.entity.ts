import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menus_racion_items')
export class MenuRacionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('MenuOficial', 'itemsRacion', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: any;

  @Column({ name: 'opcion_codigo', length: 20 })
  opcionCodigo: string;

  @Column({ name: 'grupo_beneficiario', length: 120 })
  grupoBeneficiario: string;

  @Column({ name: 'alimento_nombre', length: 150 })
  alimentoNombre: string;

  @Column({ name: 'presentacion', length: 120 })
  presentacion: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  cantidad: number;

  @Column({ length: 20 })
  unidad: string;

  @Column({ name: 'origen_compra', type: 'varchar', length: 30, default: 'por_definir' })
  origenCompra: string;

  @Column({ name: 'grupo_nutriente', nullable: true, length: 80 })
  grupoNutriente: string;

  @Column({ name: 'alimento_id', type: 'uuid', nullable: true })
  alimentoId: string;
}