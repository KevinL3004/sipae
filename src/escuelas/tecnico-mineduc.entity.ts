import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToOne, JoinColumn, OneToMany
} from 'typeorm';
import { Usuario } from '../users/usuario.entity.js';

@Entity('tecnicos_mineduc')
export class TecnicoMineduc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'codigo_empleado', nullable: true, length: 30 })
  codigoEmpleado: string;

  @Column({ nullable: true, length: 20 })
  telefono: string;

  @Column({ name: 'region_asignada', length: 100 })
  regionAsignada: string;

  @Column({ nullable: true, length: 80 })
  departamento: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}