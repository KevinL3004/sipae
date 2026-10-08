import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Escuela } from '../escuelas/escuela.entity.js';
import { Usuario } from '../users/usuario.entity.js';

@Entity('menus_escuelas')
export class MenuDistribucion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('MenuOficial', 'distribuciones', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: any;

  @ManyToOne(() => Escuela, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'escuela_id' })
  escuela: Escuela;

  @ManyToOne(() => Usuario, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'distribuido_por' })
  distribuidoPor: Usuario;

  @CreateDateColumn({ name: 'distribuido_en', type: 'timestamptz' })
  distribuidoEn: Date;

  get menuId(): string {
    return this.menu?.id;
  }

  get escuelaId(): string {
    return this.escuela?.id;
  }
}