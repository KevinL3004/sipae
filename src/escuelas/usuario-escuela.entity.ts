import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Usuario } from '../users/usuario.entity.js';
import { Escuela } from './escuela.entity.js';

@Entity('usuarios_escuela')
export class UsuarioEscuela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Escuela, { eager: true })
  @JoinColumn({ name: 'escuela_id' })
  escuela: Escuela;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'asignado_en', type: 'timestamptz' })
  asignadoEn: Date;
}